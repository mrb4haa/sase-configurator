import { useMemo, useState } from 'react';
import { CopyButton } from './components/CopyButton';
import { FormField } from './components/FormField';
import { SectionCard } from './components/SectionCard';
import { FormValues, GeneratedConfig, generateConfiguration } from './lib/configGenerator';

const defaultValues: FormValues = {
  healthCheckIp: '',
  bgpLoopbackIp: '',
  bgpNeighborRange: '',
  bgpAs: '',
  bgpLoopbackSummary: '',
  internalNetworks: '',
  ipsecPsk: '',
  wanInterface: 'port1',
  tunnel1Name: 'RUH-DC-01',
  tunnel2Name: 'RUH-DC-02',
  internalInterface: 'port2',
  internalNetworkObjects: 'all',
  aggregateInterface: 'SASE-TUNNEL'
};

const requiredFields: Array<keyof FormValues> = [
  'healthCheckIp',
  'bgpLoopbackIp',
  'bgpNeighborRange',
  'bgpAs',
  'bgpLoopbackSummary',
  'internalNetworks',
  'ipsecPsk'
];

const randomCharset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-?';

function generateSecureKey(length = 28) {
  const array = new Uint32Array(length);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i += 1) {
      array[i] = Math.floor(Math.random() * randomCharset.length);
    }
  }

  return Array.from(array, (value) => randomCharset[value % randomCharset.length]).join('');
}

export default function App() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [generated, setGenerated] = useState<GeneratedConfig | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const isValid = useMemo(
    () => requiredFields.every((field) => values[field].trim().length > 0),
    [values]
  );

  const handleGenerate = () => {
    if (!isValid) {
      const nextErrors: Partial<Record<keyof FormValues, string>> = {};
      requiredFields.forEach((field) => {
        if (!values[field].trim()) {
          nextErrors[field] = 'This field is required to build the CLI.';
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setGenerated(generateConfiguration(values));
  };

  const handleReset = () => {
    setValues(defaultValues);
    setGenerated(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row">
        <aside className="lg:w-[32rem] xl:w-[36rem]">
          <div className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-8 shadow-card">
            <header className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                  <span className="font-heading text-2xl font-semibold text-primary">F</span>
                </div>
                <div>
                  <p className="font-heading text-sm uppercase tracking-[0.3em] text-text-muted">FortiConfigurator</p>
                  <h1 className="font-heading text-3xl font-semibold text-text-base">
                    FortiSASE SPA / BGP / IPsec CLI Generator
                  </h1>
                </div>
              </div>
              <p className="text-sm text-text-muted">
                Generate ready-to-paste FortiGate configuration for FortiSASE SPA tunnels, BGP loopbacks, and
                baseline security policies. Opinionated defaults keep you fast and compliant.
              </p>
            </header>

            <section className="flex flex-col gap-6">
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-text-base">Loopbacks &amp; BGP</h2>
                <FormField
                  id="bgpLoopbackIp"
                  label="BGP Loopback / Peer IP"
                  value={values.bgpLoopbackIp}
                  onChange={(v) => setValues((prev) => ({ ...prev, bgpLoopbackIp: v }))
                  helperText="Example: 10.233.250.242/32. Used for SASE-BGP loopback, location-id, router-id."
                  placeholder="10.233.250.242/32"
                  required
                  error={errors.bgpLoopbackIp}
                />
                <FormField
                  id="healthCheckIp"
                  label="Health Check Loopback IP"
                  value={values.healthCheckIp}
                  onChange={(v) => setValues((prev) => ({ ...prev, healthCheckIp: v }))
                  helperText="Example: 10.234.250.30/32. SPA health-check loopback interface."
                  placeholder="10.234.250.30/32"
                  required
                  error={errors.healthCheckIp}
                />
                <FormField
                  id="bgpNeighborRange"
                  label="BGP Neighbor-Range Prefix"
                  value={values.bgpNeighborRange}
                  onChange={(v) => setValues((prev) => ({ ...prev, bgpNeighborRange: v }))
                  helperText="Example: 10.233.250.0/28. Applied to config neighbor-range."
                  placeholder="10.233.250.0/28"
                  required
                  error={errors.bgpNeighborRange}
                />
                <FormField
                  id="bgpAs"
                  label="Local BGP AS"
                  value={values.bgpAs}
                  onChange={(v) => setValues((prev) => ({ ...prev, bgpAs: v }))
                  helperText="Example: 65001. Applied to router bgp and neighbor group remote-as."
                  placeholder="65001"
                  required
                  error={errors.bgpAs}
                />
                <FormField
                  id="bgpSummary"
                  label="BGP Loopback Summary Subnet"
                  value={values.bgpLoopbackSummary}
                  onChange={(v) => setValues((prev) => ({ ...prev, bgpLoopbackSummary: v }))
                  helperText="Example: 10.233.250.0 255.255.255.0. Added to config network with LOCAL_REGION route-map."
                  placeholder="10.233.250.0 255.255.255.0"
                  required
                  error={errors.bgpLoopbackSummary}
                />
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-text-base">IPsec &amp; SPA</h2>
                <FormField
                  id="wanInterface"
                  label="WAN Interface"
                  value={values.wanInterface}
                  onChange={(v) => setValues((prev) => ({ ...prev, wanInterface: v }))
                  helperText="Default: port1. Applied to both IPsec phase1 interfaces."
                  placeholder="port1"
                />
                <FormField
                  id="tunnel1Name"
                  label="Tunnel 1 Name"
                  value={values.tunnel1Name}
                  onChange={(v) => setValues((prev) => ({ ...prev, tunnel1Name: v.slice(0, 35) }))
                  helperText="Auto-generated. Limited to 35 characters."
                  placeholder="RUH-DC-01"
                />
                <FormField
                  id="tunnel2Name"
                  label="Tunnel 2 Name"
                  value={values.tunnel2Name}
                  onChange={(v) => setValues((prev) => ({ ...prev, tunnel2Name: v.slice(0, 35) }))
                  helperText="Auto-generated. Limited to 35 characters."
                  placeholder="RUH-DC-02"
                />
                <FormField
                  id="ipsecPsk"
                  label="IPsec Preshared Key"
                  value={values.ipsecPsk}
                  onChange={(v) => setValues((prev) => ({ ...prev, ipsecPsk: v }))
                  helperText="Use the generator for a strong key shared across both tunnels."
                  placeholder="Generate or paste secure key"
                  required
                  error={errors.ipsecPsk}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setValues((prev) => ({ ...prev, ipsecPsk: generateSecureKey() }))}
                      className="whitespace-nowrap rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-text-base transition hover:bg-hover-bg"
                    >
                      Generate
                    </button>
                  }
                />
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-text-base">Internal Networks</h2>
                <FormField
                  id="internalNetworks"
                  label="Internal Network(s) to Advertise"
                  value={values.internalNetworks}
                  onChange={(v) => setValues((prev) => ({ ...prev, internalNetworks: v }))
                  helperText={
                    <span>
                      One prefix per line. Example:<br />10.233.250.0 255.255.255.0
                    </span>
                  }
                  placeholder={"10.233.250.0 255.255.255.0\n10.132.10.0 255.255.252.0"}
                  multiline
                  rows={4}
                  required
                  error={errors.internalNetworks}
                />
                <FormField
                  id="aggregateInterface"
                  label="SPA Tunnel Aggregate Interface"
                  value={values.aggregateInterface}
                  onChange={(v) => setValues((prev) => ({ ...prev, aggregateInterface: v }))
                  helperText="Interface used as source for policies (e.g., SASE-TUNNEL)."
                  placeholder="SASE-TUNNEL"
                />
                <FormField
                  id="internalInterface"
                  label="Internal Interface Name"
                  value={values.internalInterface}
                  onChange={(v) => setValues((prev) => ({ ...prev, internalInterface: v }))
                  helperText="Destination interface for SASE-to-internal policy."
                  placeholder="port2"
                />
                <FormField
                  id="internalObjects"
                  label="Internal Network Object(s)"
                  value={values.internalNetworkObjects}
                  onChange={(v) => setValues((prev) => ({ ...prev, internalNetworkObjects: v }))
                  helperText="Use 'all' or a comma-separated list of address objects."
                  placeholder="all"
                />
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isValid}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#c81d24] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Generate Config
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-md border border-border px-4 py-3 text-sm font-semibold uppercase tracking-wide text-text-base transition hover:bg-hover-bg"
                >
                  Reset
                </button>
              </div>
              {!isValid && (
                <p className="text-xs text-red-500">
                  Complete all required fields to enable configuration generation.
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col gap-6">
            {!generated ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center text-text-muted">
                <h2 className="font-heading text-2xl font-semibold text-text-base">Configuration Preview</h2>
                <p className="mt-2 max-w-xl text-sm text-text-muted">
                  Populate the form with your SPA loopbacks, BGP AS, and internal networks, then hit “Generate Config”.
                  The FortiGate CLI snippets will appear here, ready to copy section-by-section or as a full template.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {generated.sections.map((section) => (
                  <SectionCard key={section.id} title={section.title} description={section.description} content={section.content} />
                ))}
                <section className="flex flex-col gap-4 rounded-xl border border-primary bg-card p-6 shadow-card">
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-text-base">Full Configuration</h3>
                      <p className="text-sm text-text-muted">
                        Concatenated CLI ready for direct paste into your FortiGate session.
                      </p>
                    </div>
                    <CopyButton value={generated.fullConfig} label="Copy Full CLI" variant="primary" />
                  </header>
                  <div className="overflow-hidden rounded-lg border border-border bg-[#f4f4f4]">
                    <pre className="max-h-[420px] overflow-auto p-4 text-sm leading-relaxed text-text-base">
                      <code className="font-mono whitespace-pre text-xs sm:text-sm">{generated.fullConfig}</code>
                    </pre>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
