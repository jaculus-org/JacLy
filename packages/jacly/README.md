# `@jaculus/jacly`

Jacly is the Blockly-based editor package used in the Jaculus ecosystem.

This package contains:

- block schema and `.jacly.json` validation
- block registration and toolbox loading
- runtime engine state and reload logic
- React editor integration
- code generation helpers
- workspace validation and placeholder recovery

## Public entry points

The package exports these subpaths:

- `@jaculus/jacly/editor`
- `@jaculus/jacly/schema`
- `@jaculus/jacly/blocks`
- `@jaculus/jacly/toolbox`
- `@jaculus/jacly/codegen`
- `@jaculus/jacly/workspace`
- `@jaculus/jacly/engine`
- `@jaculus/jacly/project`
- `@jaculus/jacly/utils`

## Package map

Source layout:

- [`src/schema`](./src/schema): zod schema, input node schema, exported config/block types
- [`src/blocks`](./src/blocks): block registration, aliases, callback vars, constructor/instance behavior
- [`src/toolbox`](./src/toolbox): parse/localize/register/build toolbox categories from block files
- [`src/engine`](./src/engine): engine state, transactional reload, workspace attachment
- [`src/editor`](./src/editor): React editor component and Blockly UI integrations
- [`src/codegen`](./src/codegen): placeholder replacement, imports, warnings, workspace-to-code
- [`src/workspace`](./src/workspace): workspace validation, unsupported block recovery, editor rules
- [`src/project`](./src/project): request helpers for loading block assets
- [`src/utils`](./src/utils): small shared helpers

Relevant docs:

- [Block definition reference](./docs/block-definition.md)
- [Blocks category docs](./docs/blocks-category.md)

## Main runtime flow

Block loading path:

1. Parse `.jacly.json` files with [`JaclyConfigSchema`](./src/schema/index.ts)
2. Register full block definitions and generators
3. Resolve alias-only blocks against registered definitions
4. Enrich nested default `block` / `shadow` inputs
5. Build Blockly toolbox categories

Core files:

- [`toolbox-processing.ts`](./src/toolbox/loading/toolbox-processing.ts)
- [`toolbox-loader.ts`](./src/toolbox/loading/toolbox-loader.ts)
- [`register-block.ts`](./src/blocks/registration/register-block.ts)
- [`register-code-generator.ts`](./src/codegen/generators/register-code-generator.ts)
- [`engine.ts`](./src/engine/engine.ts)

## Typical usage

React editor:

```tsx
import { JaclyEditor } from '@jaculus/jacly/editor';
import { JaclyEngine } from '@jaculus/jacly/engine';

const engine = new JaclyEngine();
```

The editor expects:

- `jaclyBlocksData` from `@jaculus/project`
- initial workspace JSON
- callbacks for workspace JSON changes and generated code
- a missing-package resolver used during workspace validation

See:

- [`editor.tsx`](./src/editor/components/editor.tsx)
- [`engine.ts`](./src/engine/engine.ts)

## Important implementation details

### Nested helper blocks

Jacly supports nested default blocks in two forms:

- `shadow`: default shadow block
- `block`: preconnected real block

Nested defaults are enriched from registered canonical block inputs, including alias overrides.

Files:

- [`enrich-block-inputs.ts`](./src/blocks/aliases/enrich-block-inputs.ts)
- [`edit-internal-block.ts`](./src/blocks/aliases/edit-internal-block.ts)

### Runtime reload

`JaclyEngine.reloadBlockData()` rebuilds block state transactionally:

- parse new configs
- build a fresh engine state
- snapshot touched Blockly registrations
- commit only if the rebuild succeeds
- reattach engine workspace listeners against the new state

File:

- [`engine.ts`](./src/engine/engine.ts)

### Workspace recovery

If a workspace contains blocks whose package is not currently available, Jacly:

- keeps the original serialized state
- replaces unsupported top-level blocks with placeholders
- hoists unsupported nested blocks when needed
- restores original blocks after the package becomes available again

Files:

- [`workspace-validation.ts`](./src/workspace/validation/workspace-validation.ts)
- [`unsupported-blocks.ts`](./src/workspace/validation/unsupported-blocks.ts)

## Tests

Test suite:

- [`tests/mocha/alias-resolution.test.ts`](./tests/mocha/alias-resolution.test.ts)
- [`tests/mocha/reload-block-data.test.ts`](./tests/mocha/reload-block-data.test.ts)
- [`tests/mocha/workspace-validation.test.ts`](./tests/mocha/workspace-validation.test.ts)
- [`tests/mocha/editor-lifecycle.test.ts`](./tests/mocha/editor-lifecycle.test.ts)
- [`tests/mocha/codegen-and-instances.test.ts`](./tests/mocha/codegen-and-instances.test.ts)

Run:

```bash
pnpm --dir packages/jacly type-check
pnpm --dir packages/jacly test:mocha
```

## Notes for maintainers

- `Blockly.Blocks` and `blockly/javascript` generator registration are global mutations. Be careful when changing reload behavior.
- Engine workspace listeners must be attached and detached symmetrically.
- Browser-facing code and Node-only code should stay explicit at module boundaries.
- When adding new `.jacly.json` features, update both schema and tests.
