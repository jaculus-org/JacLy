# JacLy renderer API design

## Goal

Add a standalone Node service under `packages/jacly-renderer` that turns a serialized JacLy/Blockly workspace into an SVG or PNG suitable for Markdown documentation. Repeating the same request must return the same immutable URL and reuse a persistent disk cache.

## API

`POST /api/render` accepts either a raw Blockly workspace or an envelope:

```json
{
  "workspace": { "blocks": { "languageVersion": 0, "blocks": [] } },
  "blockData": { "blockFiles": {} },
  "format": "svg",
  "options": {
    "theme": "light",
    "locale": "en",
    "padding": 16,
    "scale": 1
  }
}
```

`blockData` is optional when the server was started with a default JacLy block-data JSON file. A raw workspace request uses the default block data and query/output defaults. The response contains the SHA-256 hash, immutable image URL, dimensions, and whether the disk cache was hit.

`GET /api/render/:hash.svg` and `GET /api/render/:hash.png` serve generated files with an immutable cache policy. `GET /health` reports readiness.

The canonical hash covers a renderer schema/version salt, workspace, resolved block data, format, and all visual options. Object keys are sorted recursively before hashing, so semantically identical JSON key ordering produces the same URL. Array ordering remains significant.

## Architecture

- The Node HTTP layer validates request size, JSON shape, format, and render options.
- A content-addressed cache stores one atomic file per hash and format. Concurrent identical requests share one in-flight render promise.
- A long-lived Playwright Chromium instance creates an isolated page per cache miss.
- A private browser bundle imports `JaclyEngine`, Blockly built-ins, messages, and the Zelos renderer. It registers supplied JacLy block definitions, loads the workspace into a read-only Blockly workspace, calculates the block bounds, and returns a self-contained SVG with required CSS embedded.
- SVG responses are written directly. PNG responses are rasterized by Chromium from the generated SVG, avoiding a second rendering implementation.
- Server shutdown closes the browser and HTTP listener.

## Package data

Serialized workspaces contain block type names but not their visual definitions. Therefore custom blocks require `JaclyBlocksData`. Documentation deployments should normally configure one default block-data snapshot at startup; per-request `blockData` remains available for versioned or isolated documentation builds. Because resolved block data participates in the hash, changing a block definition creates a new image URL.

## Errors and limits

- Malformed JSON or invalid options: HTTP 400.
- Unknown routes or cache hashes: HTTP 404.
- Missing/unknown block definitions or browser render failures: HTTP 422 with a concise JSON error.
- Oversized request bodies: HTTP 413.
- Internal/cache failures: HTTP 500 without exposing stack traces.

The initial implementation is intentionally unauthenticated and intended for a trusted documentation pipeline. Deployment-facing rate limiting and authentication belong at a reverse proxy.

## Verification

- Unit tests cover canonical hashes, validation, raw/enveloped requests, cache reuse, immutable GET responses, and missing hashes.
- Browser integration tests render a custom JacLy block to SVG and PNG, verify dimensions/content signatures, and verify that a repeated request is a cache hit with the same URL and bytes.
- Package build and TypeScript checks run independently through the monorepo scripts.
