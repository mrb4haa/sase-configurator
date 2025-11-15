export interface FormValues {
  healthCheckIp: string;
  bgpLoopbackIp: string;
  bgpNeighborRange: string;
  bgpAs: string;
  bgpLoopbackSummary: string;
  internalNetworks: string;
  ipsecPsk: string;
  wanInterface: string;
  tunnel1Name: string;
  tunnel2Name: string;
  internalInterface: string;
  internalNetworkObjects: string;
  aggregateInterface: string;
}

export interface GeneratedSection {
  id: string;
  title: string;
  description: string;
  content: string;
}

export interface GeneratedConfig {
  sections: GeneratedSection[];
  fullConfig: string;
}

const stripMask = (cidr: string) => cidr.split('/')[0]?.trim() ?? cidr.trim();

const sanitizeLines = (input: string) =>
  input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export function generateConfiguration(values: FormValues): GeneratedConfig {
  const bgpLoopbackIpNoMask = stripMask(values.bgpLoopbackIp);
  const healthCheckIp = values.healthCheckIp.trim();
  const interfacesSection = `config system interface
    edit "SASE-BGP"
        set vdom "root"
        set type loopback
        set ip ${values.bgpLoopbackIp}
        set allowaccess ping
    next
end

config system interface
    edit "SASE-HC"
        set vdom "root"
        set type loopback
        set ip ${healthCheckIp}
        set allowaccess ping
    next
end

config system settings
    set location-id ${bgpLoopbackIpNoMask}
end`;

  const tunnelSection = (name: string) => `config vpn ipsec phase1-interface
    edit "${name}"
        set type dynamic
        set interface "${values.wanInterface}"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes128-sha256 aes256-sha256 aes128gcm-prfsha256 aes256gcm-prfsha384 chacha20poly1305-prfsha256
        set add-route disable
        set dpd on-idle
        set auto-discovery-sender enable
        set network-overlay enable
        set network-id 1
        set psksecret "${values.ipsecPsk}"
    next
end

config vpn ipsec phase1-interface
    edit "${name}"
        set exchange-ip-addr4 ${bgpLoopbackIpNoMask}
    next
end

config vpn ipsec phase2-interface
    edit "${name}"
        set phase1name "${name}"
        set proposal aes128-sha1 aes256-sha1 aes128-sha256 aes256-sha256 aes128gcm aes256gcm chacha20poly1305
        set keepalive enable
    next
end`;

  const tunnel1Section = tunnelSection(values.tunnel1Name);
  const tunnel2Section = tunnelSection(values.tunnel2Name);

  const internalNetworks = sanitizeLines(values.internalNetworks);

  const networkStatements = [
    `        edit 1\n            set prefix ${values.bgpLoopbackSummary}\n            set route-map "LOCAL_REGION"\n        next`,
    ...internalNetworks.map(
      (network, index) =>
        `        edit ${index + 2}\n            set prefix ${network}\n        next`
    )
  ].join('\n');

  const bgpSection = `config router route-map
    edit "LOCAL_REGION"
        config rule
            edit 1
                set set-community "no-export"
            next
        end
    next
end

config router bgp
    set as ${values.bgpAs}
    set router-id ${bgpLoopbackIpNoMask}
    set keepalive-timer 15
    set holdtime-timer 45
    set ebgp-multipath enable
    set ibgp-multipath enable
    set recursive-next-hop enable
    set graceful-restart enable

    config neighbor-group
        edit "FSASE"
            set soft-reconfiguration enable
            set advertisement-interval 1
            set next-hop-self enable
            set remote-as ${values.bgpAs}
            set interface "SASE-BGP"
            set update-source "SASE-BGP"
            set route-reflector-client enable
            set next-hop-self-rr enable
        next
    end

    config neighbor-range
        edit 1
            set prefix ${values.bgpNeighborRange}
            set neighbor-group "FSASE"
        next
    end

    config network
${networkStatements}
    end
end`;

  const policySection = `config firewall policy
    edit 0
        set name "SASE-HC-PING"
        set srcintf "${values.aggregateInterface}"
        set dstintf "SASE-HC"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "PING"
        set logtraffic all
    next
    edit 0
        set name "SASE-BGP-LOOPBACK"
        set srcintf "${values.aggregateInterface}"
        set dstintf "SASE-BGP"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "PING" "BGP"
        set logtraffic all
    next
    edit 0
        set name "SASE-TO-INTERNAL"
        set srcintf "${values.aggregateInterface}"
        set dstintf "${values.internalInterface}"
        set srcaddr "all"
        set dstaddr "${values.internalNetworkObjects}"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end`;

  const sections: GeneratedSection[] = [
    {
      id: 'interfaces',
      title: 'Interfaces & System Settings',
      description: 'Create loopback interfaces and set system identifiers for FortiSASE SPA.',
      content: interfacesSection
    },
    {
      id: 'tunnel1',
      title: `${values.tunnel1Name} Tunnel`,
      description: 'Primary auto-discovery IPsec tunnel parameters for SPA connectivity.',
      content: tunnel1Section
    },
    {
      id: 'tunnel2',
      title: `${values.tunnel2Name} Tunnel`,
      description: 'Secondary auto-discovery IPsec tunnel parameters for redundancy.',
      content: tunnel2Section
    },
    {
      id: 'bgp',
      title: 'BGP Configuration',
      description: 'Neighbor group, dynamic range, and networks for FortiSASE peering.',
      content: bgpSection
    },
    {
      id: 'policies',
      title: 'Security Policies',
      description: 'Baseline policies for health checks, BGP peering, and internal access.',
      content: policySection
    }
  ];

  const fullConfig = sections.map((section) => section.content).join('\n\n');

  return { sections, fullConfig };
}
