# `@jaculus/jacly-renderer`

Node service that renders serialized JacLy/Blockly workspaces to content-addressed SVG or PNG files. It uses the real `JaclyEngine`, Blockly's Zelos renderer, and headless Chromium.

## Start the server

```bash
pnpm --dir packages/jacly-renderer build
pnpm --dir packages/jacly-renderer start -- --host 0.0.0.0 --port 8787 \
  --cache-dir .jacly-render-cache \
  --libraries /Users/kuba/Documents/git/jaculus/Jaculus-libraries \
  --public-url https://renderer.example
```

The equivalent environment variables are `HOST`, `PORT`, `JACLY_RENDER_CACHE`, `JACULUS_LIBRARIES`, `JACLY_BLOCKS_FILE`, and `JACLY_RENDER_PUBLIC_URL`.

With `--libraries`, the server reads package names from each block's `extraState.package`, finds those packages in the Jaculus-libraries checkout, follows their local dependencies, and loads their `.jacly.json` files plus the selected language. For example, a workspace using `basic`, `saturn`, `game-loop`, and `@types/jaculus` needs no `blockData` in its request.

Alternatively, `--blocks` accepts a fixed `JaclyBlocksData` snapshot returned by `JacProject.getJaclyData()`. One of these sources is necessary for custom block types because a serialized workspace only stores their names and values, not their visual definitions.

## Render

With default block data configured, post the workspace JSON directly:

```bash
curl -X POST http://localhost:8787/api/render \
  -H 'content-type: application/json' \
  --data-binary @index.jacly.json
```

To select a format, theme, language, or request-specific block definitions, use the envelope:

```json
{
  "workspace": {
    "blocks": {
      "languageVersion": 0,
      "blocks": []
    }
  },
  "blockData": {
    "blockFiles": {}
  },
  "format": "svg",
  "options": {
    "theme": "light",
    "locale": "cs",
    "padding": 16,
    "scale": 1
  }
}
```

Successful response:

```json
{
  "hash": "<sha256>",
  "format": "svg",
  "url": "https://renderer.example/api/render/<sha256>.svg",
  "markdown": "![JacLy program](https://renderer.example/api/render/<sha256>.svg)",
  "width": 420,
  "height": 280,
  "cached": false
}
```

The hash includes the workspace, resolved block definitions, output format, visual options, and renderer schema version. JSON object key order does not affect it. Generated files survive server restarts in the configured cache directory, and image GET responses use `Cache-Control: public, max-age=31536000, immutable`.

## Endpoints

- `POST /api/render` creates or reuses a render.
- `GET /api/render/<hash>.svg` serves an immutable SVG.
- `GET /api/render/<hash>.png` serves an immutable PNG.
- `GET /health` returns `{ "status": "ok" }`.

The first version is intended for a trusted documentation build pipeline. Put authentication, rate limiting, HTTPS, and any public request-size policy at the reverse proxy when exposing it to the internet.
