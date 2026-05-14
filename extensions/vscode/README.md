# JacLy for VS Code

VS Code extension for opening `.jacly` files in a visual Blockly editor. It is built for Jaculus projects and runs the shared JacLy editor inside a VS Code webview.

## Features

- custom editor for `.jacly` files
- syntax support for the JacLy file type
- React-based webview using the shared `@jaculus/jacly` package

## Development

```bash
pnpm --filter jacly-vscode compile
pnpm --filter jacly-vscode build
```

Requires VS Code 1.109.0 or later. The current packaged extension file is `jacly-vscode-<version>.vsix` and can be installed with:

```bash
code --install-extension jacly-vscode-<version>.vsix
```



## Release Notes

### 0.0.1

Initial release.


## License

Everything in this repository, unless otherwise noted, is licensed under the MIT License. See [../../LICENSE](../../LICENSE).
