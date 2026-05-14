# JacLy Web

Browser application for JacLy and Jaculus projects. It provides the visual editor, project management, device connection, console output, installer views, documentation pages, and Wokwi simulator integration.

## Development

Use Node.js `20.19` or newer, or Node.js `22.12` or newer.

```bash
pnpm --filter @jaculus/jacly-web dev
pnpm --filter @jaculus/jacly-web build
pnpm --filter @jaculus/jacly-web test
```

Production files are written to `apps/web/dist`. The local development server runs at http://localhost:5445. Web Serial requires a Chromium-based browser, such as Chrome or Edge.

The deployed app is intended to be available at https://jacly.jaculus.org.

## License

Everything in this repository, unless otherwise noted, is licensed under the MIT License. See [../../LICENSE](../../LICENSE).
