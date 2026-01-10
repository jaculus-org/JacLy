import { z } from 'zod';
import { zodToJsonSchema } from '@alcyone-labs/zod-to-json-schema';

const SemVer = z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be x.y.z');
const Url = z.url('must be a valid URL');
const Identifier = z
  .string()
  .regex(/^[a-zA-Z0-9-_]+$/, 'must be a valid identifier');

const Variable = Identifier.uppercase('variable must be uppercase identifier');

const BlocklyColour = z.union([
  z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'must be hex color like #aabbcc'
    ),
  z
    .string()
    .regex(
      /^(?:[0-9]|[1-9]\d|[12]\d{2}|3[0-5]\d|360)$/,
      'must be 0–360 hue string'
    ),
]);

// const DefaultType = z.enum(['Number', 'String', 'Boolean', 'Array', 'Object']);
const ArgsCheck = z.union([z.string().optional(), z.array(z.string())]);

const ArgOptions = z.array(z.tuple([z.string(), z.string()])).optional();

const InputBlockSchema = z.object({
  type: Identifier.nonempty('type is required'),
  fields: z.record(Variable, z.any()).optional(),
});

const InputShadowSchema = z.object({
  type: Identifier.nonempty('type is required'),
  fields: z.record(Variable, z.any()).optional(),
});

// Base schema for all args
const JaclyArgsBase = z.object({
  name: Variable,
  block: InputBlockSchema.optional(),
  shadow: InputShadowSchema.optional(),
});

// Field types with specific properties
const JaclyArgsFieldInput = JaclyArgsBase.extend({
  type: z.literal('field_input'),
  text: z.string().optional(),
  spellcheck: z.boolean().optional(),
});

const JaclyArgsFieldNumber = JaclyArgsBase.extend({
  type: z.literal('field_number'),
  value: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  precision: z.number().optional(),
});

const JaclyArgsFieldDropdown = JaclyArgsBase.extend({
  type: z.literal('field_dropdown'),
  options: ArgOptions,
  instanceof: Identifier.optional(),
});

// const JaclyArgsFieldCheckbox = JaclyArgsBase.extend({
//   type: z.literal('field_checkbox'),
//   checked: z.boolean().optional(),
// });

// const JaclyArgsFieldColour = JaclyArgsBase.extend({
//   type: z.literal('field_colour'),
//   colour: z.string().optional(),
// });

// const JaclyArgsFieldAngle = JaclyArgsBase.extend({
//   type: z.literal('field_angle'),
//   angle: z.number().optional(),
// });

// const JaclyArgsFieldVariable = JaclyArgsBase.extend({
//   type: z.literal('field_variable'),
//   variable: z.string().optional(),
//   variableTypes: z.array(z.string()).optional(),
// });

// const JaclyArgsFieldLabel = JaclyArgsBase.extend({
//   type: z.literal('field_label'),
//   text: z.string().optional(),
// });

// const JaclyArgsFieldImage = JaclyArgsBase.extend({
//   type: z.literal('field_image'),
//   src: z.string(),
//   width: z.number(),
//   height: z.number(),
//   alt: z.string().optional(),
// });

// Input types
const JaclyArgsInputValue = JaclyArgsBase.extend({
  type: z.literal('input_value'),
  align: z.enum(['LEFT', 'RIGHT', 'CENTRE']).optional(),
  check: ArgsCheck.optional(),
});

const JaclyArgsInputStatement = JaclyArgsBase.extend({
  type: z.literal('input_statement'),
  align: z.enum(['LEFT', 'RIGHT', 'CENTRE']).optional(),
});

// const JaclyArgsInputDummy = JaclyArgsBase.extend({
//   type: z.literal('input_dummy'),
//   align: z.enum(['LEFT', 'RIGHT', 'CENTRE']).optional(),
// });

// const JaclyArgsInputEndRow = JaclyArgsBase.extend({
//   type: z.literal('input_end_row'),
// });

// Discriminated union of all arg types
const JaclyArgs = z.discriminatedUnion('type', [
  JaclyArgsFieldInput,
  JaclyArgsFieldNumber,
  JaclyArgsFieldDropdown,
  // JaclyArgsFieldCheckbox,
  // JaclyArgsFieldColour,
  // JaclyArgsFieldAngle,
  // JaclyArgsFieldVariable,
  // JaclyArgsFieldLabel,
  // JaclyArgsFieldImage,
  JaclyArgsInputValue,
  JaclyArgsInputStatement,
  // JaclyArgsInputDummy,
  // JaclyArgsInputEndRow,
]);

export const ToolboxInputsSchema = z.record(
  Variable,
  z.object({
    block: InputBlockSchema.optional(),
    shadow: InputShadowSchema.optional(),
  })
);

export const JaclyBlockSchema = z.object({
  kind: z.enum(['block', 'category', 'separator']),
  type: Identifier.nonempty('type is required'),
  message0: z.string().optional(),
  args0: z.array(JaclyArgs).optional(),
  tooltip: z.string().optional(),
  isProgramStart: z.boolean().default(false),
  code: z.string().optional(),
  previousStatement: z.union([z.string(), z.null()]).optional(),
  nextStatement: z.union([z.string(), z.null()]).optional(),
  inputs: ToolboxInputsSchema.optional(),

  // auto configured from root config
  colour: BlocklyColour.optional(),
  style: z.string().optional(),

  // JacLy extensions
  constructs: Identifier.optional(),
});

export const JaclyConfigSchema = z.object({
  version: SemVer,
  author: z.string().nonempty('author is required'),
  github: Url.optional(),
  license: z.string().nonempty('license is required'),

  category: Identifier.nonempty('category is required'),
  name: Identifier.nonempty('name is required'),
  description: z.string().optional(),
  docs: z.string().optional(),
  colour: BlocklyColour.optional(),
  style: z.string().optional(),
  custom: z.string().optional(),
  categorystyle: z.string().optional(),
  libraries: z.array(z.string()).optional(),

  contents: z.array(JaclyBlockSchema).optional(),
});

export type JaclyConfig = z.infer<typeof JaclyConfigSchema>;
export type JaclyBlock = z.infer<typeof JaclyBlockSchema>;
export type JaclyBlocksArgs = z.infer<typeof JaclyArgs>;

export function jaclyJsonSchema() {
  return zodToJsonSchema(JaclyConfigSchema, 'jaculus-project');
}
