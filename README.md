# JacLy

JacLy is a Blockly-based editor for building Jaculus projects. This repository contains the web app, the shared editor package, the VS Code extension, and the Wokwi simulator integration.

## Projects

- `packages/jacly` - shared Blockly editor library used by the web app and VS Code extension.
- `apps/web` - browser application for editing, building, running, and simulating Jaculus projects.
- `extensions/vscode` - VS Code extension with a visual editor for `.jacly` files.
- `packages/jaculus-wokwi` - Wokwi integration used by the simulator.

Related repositories are under https://github.com/jaculus-org, including `Jaculus-tools`, `Jaculus-registry`, and `Jaculus-libraries`.

## Development

This monorepo uses `pnpm`. Use Node.js `20.19` or newer, or Node.js `22.12` or newer.

```bash
pnpm install
pnpm --filter @jaculus/jacly build
pnpm --filter @jaculus/jacly-web build
pnpm --filter jacly-vscode build
```

The web app development server runs at http://localhost:5445:

```bash
pnpm --filter @jaculus/jacly-web dev
```

The deployed app is intended to be available at https://jacly.jaculus.org.

## License

Everything in this repository, unless otherwise noted, is licensed under the MIT License. See [LICENSE](./LICENSE).
