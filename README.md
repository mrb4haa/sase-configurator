# FortiConfigurator

FortiConfigurator is a single-page React application for Fortinet engineers to generate ready-to-paste FortiGate CLI covering FortiSASE SPA tunnels, BGP loopbacks, health checks, and baseline security policies.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Key features

- Opinionated form that captures loopback, BGP, SPA, and internal network parameters.
- Instant generation of FortiGate CLI split by section with individual copy actions.
- Secure preshared key generator aligned with Fortinet naming and style guidance.
- Premium light-mode UI inspired by Fortinet branding and optimized for responsive use.
