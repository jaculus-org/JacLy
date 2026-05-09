# `@jaculus/jacly`

Jacly is the Blockly-based visual editor package for the Jaculus ecosystem. It loads `.jacly.json` block definition files, registers them with Blockly, builds the toolbox, and generates JavaScript that runs on Jaculus-compatible hardware.

## How it works

### The engine

`JaclyEngine` is the single entry point. It owns an `EngineState` object — a plain bag of Maps and Sets that tracks all registered block types, constructor/instance metadata, toolbox content, and workspace listeners. The state is rebuilt from scratch on every `reloadBlockData()` call so there is no incremental diffing; the old state is cleared and the new one is swapped in atomically (with a snapshot/restore rollback if parsing fails).

```
JaclyEngine
  └─ EngineState                  — mutable store, one per engine
       ├─ Blockly.Blocks[type]    — global Blockly registrations (shared, managed carefully)
       ├─ constructorBlockTypesBySystem  — "motor" → {motor_constructor, …}
       ├─ instanceTrackers: WeakMap  — one tracker per attached workspace
       └─ flatCategoryItems       — pre-hierarchy snapshot for examples toggle
```

### Block files

Each `.jacly.json` file defines one toolbox category. It can contain:

- **Full block definitions** — have `message0`, `args0`, and `code`; registered globally in `Blockly.Blocks`.
- **Alias entries** — have only `type`; borrow a block already registered by another package and optionally override its color or shadow inputs.
- **Examples** — a separate `examples` array; blocks are registered but shown only when the user expands the examples section.

See the [block definition reference](./docs/block-definition.md) for the full field reference.

### Two-pass loading

Block loading always runs in two passes to avoid ordering dependencies between packages:

1. **Registration pass** — all full definitions are registered globally (Blockly.Blocks + generator).
2. **Toolbox build pass** — aliases are resolved, shadow inputs are enriched, and the Blockly toolbox definition is assembled.

Pass 2 can safely reference any block type because pass 1 has already registered everything.

Key files: [`toolbox-processing.ts`](./src/toolbox/loading/toolbox-processing.ts), [`block-registration-pass.ts`](./src/toolbox/loading/block-registration-pass.ts), [`alias-resolution.ts`](./src/toolbox/loading/alias-resolution.ts).

### Constructor / instance system

The most unique part of Jacly. A block marked `"constructs": "motor"` creates a named object in the workspace (`motor_0`, `motor_1`, …). Any block with a `field_dropdown` marked `"instanceof": "motor"` shows a live dropdown of all motor instances currently in the workspace.

- The **constructor mixin** (`constructor-mixin.ts`) auto-resolves `_?` placeholder names on first placement and rebuilds the tracker on every name change.
- The **instance tracker** (`instance-tracker.ts`) is a point-in-time snapshot, rebuilt from scratch whenever a constructor block is added, removed, renamed, or moved. It is not reactive.
- The **instance dropdown** (`instance-dropdown.ts`) re-queries the tracker each time the dropdown opens. During deserialization it uses `savedInstanceNames` (set by `loadExtraState`) to keep field values valid before constructors are registered.
- **Virtual instances** let one constructor (e.g. `robutek2`) expose sub-objects as instances of another type (e.g. `motor`) without requiring separate constructor blocks.

See the [blocks category docs](./docs/blocks-category.md) for the JSON syntax.

### Code generation

Generated output has three parts, prepended in order:

1. **Import statements** — collected from `blockImports` (the `import` field in block definitions).
2. **Global constructor declarations** — `let motor_0; let d_drive_0;` etc. Constructor names must be hoisted so they are accessible across multiple async event handlers.
3. **Workspace code** — produced by Blockly's JavaScript generator. Constructor blocks emit assignments (`motor_0 = new Motor(…)`) rather than declarations because the `const/let/var` keyword is stripped; the `let` was already emitted in step 2.

All loops yield `await sleep(0)` after each iteration and all procedures are `async` so that user code can `await` sensors, motors, and timers without blocking the event loop on embedded hardware.

### Workspace validation and recovery

When a saved workspace is loaded and a required package is absent:

1. Any `unsupported_block` placeholders from a previous load are restored if the type is now registered.
2. Still-missing types are grouped by package and passed to `onMissingPackage` so the caller can prompt the user to install them.
3. Remaining unresolved blocks are replaced with `unsupported_block` placeholders that preserve the full original JSON. When the package is later installed, the placeholder is swapped back for the real block.

Key files: [`workspace-validation.ts`](./src/workspace/validation/workspace-validation.ts), [`unsupported-blocks.ts`](./src/workspace/validation/unsupported-blocks.ts).

---

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

## Typical usage

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

See [`engine.ts`](./src/engine/engine.ts).

## Tests

- [`tests/mocha/alias-resolution.test.ts`](./tests/mocha/alias-resolution.test.ts)
- [`tests/mocha/reload-block-data.test.ts`](./tests/mocha/reload-block-data.test.ts)
- [`tests/mocha/workspace-validation.test.ts`](./tests/mocha/workspace-validation.test.ts)
- [`tests/mocha/editor-lifecycle.test.ts`](./tests/mocha/editor-lifecycle.test.ts)
- [`tests/mocha/codegen-and-instances.test.ts`](./tests/mocha/codegen-and-instances.test.ts)

```bash
pnpm --dir packages/jacly type-check
pnpm --dir packages/jacly test:mocha
```

## Notes for maintainers

- `Blockly.Blocks` and `blockly/javascript` generator registrations are global mutations shared across all engine instances. Be careful when changing reload behavior.
- Engine workspace listeners must be attached and detached symmetrically.
- The instance tracker is a snapshot, not a live view — always call `rebuild()` after any change that affects constructor names.
- When adding new `.jacly.json` features, update both the schema (`src/schema/index.ts`) and tests.
