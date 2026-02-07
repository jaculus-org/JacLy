import { z } from 'zod';

const SemVer = z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be x.y.z');
const Url = z.url('must be a valid URL');
const Identifier = z
  .string("must be a valid identifier - letters, numbers, '-', '_'")
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

// Forward declaration for recursive shadow/block definitions
const InputShadowSchema: z.ZodType<{
  type: string;
  fields?: Record<string, any>;
  inputs?: Record<string, { shadow?: any; block?: any }>;
}> = z.lazy(() =>
  z.object({
    type: Identifier.nonempty('type is required'),
    fields: z.record(Variable, z.any()).optional(),
    inputs: z
      .record(
        Variable,
        z.object({
          shadow: InputShadowSchema.optional(),
          block: InputBlockSchema.optional(),
        })
      )
      .optional(),
  })
);

const InputBlockSchema: z.ZodType<{
  type: string;
  fields?: Record<string, any>;
  inputs?: Record<string, { shadow?: any; block?: any }>;
}> = z.lazy(() =>
  z.object({
    type: Identifier.nonempty('type is required'),
    fields: z.record(Variable, z.any()).optional(),
    inputs: z
      .record(
        Variable,
        z.object({
          shadow: InputShadowSchema.optional(),
          block: InputBlockSchema.optional(),
        })
      )
      .optional(),
  })
);

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
  check: ArgsCheck.optional(),
});

const JaclyArgsInputDummy = JaclyArgsBase.extend({
  type: z.literal('input_dummy'),
  align: z.enum(['LEFT', 'RIGHT', 'CENTRE']).optional(),
});

const JaclyArgsInputEndRow = JaclyArgsBase.extend({
  type: z.literal('input_end_row'),
});

const ColourHsvSlider = JaclyArgsBase.extend({
  type: z.literal('field_colour_hsv_sliders'),
  colour: z.string().optional(),
});

const ColourField = JaclyArgsBase.extend({
  type: z.literal('field_colour'),
  colour: z.string().optional(),
});

const ColourFieldSelect = JaclyArgsBase.extend({
  type: z.literal('color_field_select'),
  colour: z.string().optional(),
});

// // Field label serializable (for callback variable labels)
// const JaclyArgsFieldLabelSerializable = JaclyArgsBase.extend({
//   type: z.literal('field_label_serializable'),
//   text: z.string().optional(),
//   class: z.string().optional(),
// });

// Discriminated union of all arg types
const JaclyArgs = z.discriminatedUnion('type', [
  JaclyArgsFieldInput,
  JaclyArgsFieldNumber,
  JaclyArgsFieldDropdown,
  // JaclyArgsFieldLabelSerializable,
  // JaclyArgsFieldCheckbox,
  // JaclyArgsFieldColour,
  // JaclyArgsFieldAngle,
  // JaclyArgsFieldVariable,
  // JaclyArgsFieldLabel,
  // JaclyArgsFieldImage,
  JaclyArgsInputValue,
  JaclyArgsInputStatement,
  JaclyArgsInputDummy,
  JaclyArgsInputEndRow,

  ColourField,
  ColourHsvSlider,
  ColourFieldSelect,
]);

export const ToolboxInputsSchema = z.record(
  Variable,
  z.object({
    block: InputBlockSchema.optional(),
    shadow: InputShadowSchema.optional(),
  })
);

// Schema for callback variables (scoped variables available inside callback blocks)
const CallbackVarSchema = z.object({
  name: z.string().nonempty('callback variable name is required'),
  type: z.string().optional(), // Blockly output type (e.g., "Number", "String")
  codeName: z.string().nonempty('codeName is required for code generation'),
});

// "codeConditionals": [{ "condition": [ { "$[UNIT]": "distance" } ], "code": "..." }]
const CodeConditionalsSchema = z.array(
  z.object({
    condition: z.array(z.record(z.string(), z.string())),
    code: z.string().nonempty('code is required for codeConditional'),
  })
);

// Schema for kind: 'block'
const JaclyBlockKindBlock = z
  .object({
    kind: z.literal('block'),
    type: Identifier.nonempty('type is required'),
    message0: z.string().optional(),
    args0: z.array(JaclyArgs).optional(),
    tooltip: z.string().optional(),
    isProgramStart: z.boolean().optional(),
    code: z.string().optional(),
    codeConditionals: CodeConditionalsSchema.optional(),
    output: z.union([z.string(), z.null()]).optional(),
    previousStatement: z.union([z.string(), z.null()]).optional(),
    nextStatement: z.union([z.string(), z.null()]).optional(),
    inputs: ToolboxInputsSchema.optional(),
    inputsInline: z.boolean().optional(),
    mutator: z.string().optional(),

    // auto configured from root config
    colour: BlocklyColour.optional(),
    style: z.string().optional(),

    // JacLy extensions
    hideInToolbox: z.boolean().optional(),
    constructs: Identifier.optional(),
    callbackVars: z.array(CallbackVarSchema).optional(),
  })
  .refine(
    data => {
      const hasOutput = data.output !== undefined;
      const hasStatementConnection =
        data.previousStatement !== undefined ||
        data.nextStatement !== undefined;
      return !(hasOutput && hasStatementConnection);
    },
    {
      message:
        'Block cannot have both "output" and "previousStatement"/"nextStatement" - use output for value blocks OR statement connections for stackable blocks',
    }
  );

// Schema for kind: 'category'
const JaclyBlockKindCategory = z.object({
  kind: z.literal('category'),
  name: z.string().nonempty('name is required for category'),
  colour: BlocklyColour.optional(),
  categorystyle: z.string().optional(),
  custom: z.string().optional(),
});

// Schema for kind: 'separator'
const JaclyBlockKindSeparator = z.object({
  kind: z.literal('separator'),
  gap: z.number().optional(),
});

// Schema for kind: 'label'
const JaclyBlockKindLabel = z.object({
  kind: z.literal('label'),
  text: z.string().nonempty('text is required for label'),
  'web-class': z.string().optional(),
});

// Discriminated union of all block kinds
export const JaclyBlockSchema = z.discriminatedUnion('kind', [
  JaclyBlockKindBlock,
  JaclyBlockKindCategory,
  JaclyBlockKindSeparator,
  JaclyBlockKindLabel,
]);

export const JaclyConfigSchema = z.object({
  $schema: z.string().optional(),
  version: SemVer,
  author: z.string().nonempty('author is required'),
  github: Url.optional(),
  license: z.string().nonempty('license is required'),

  category: Identifier,
  parentCategory: Identifier.optional(),

  name: z.string().nonempty('name is required'),
  description: z.string().optional(),
  docs: z.string().optional(),
  colour: BlocklyColour.optional(),
  style: z.string().optional(),
  icon: z.string().optional(),
  custom: z.string().optional(),
  categorystyle: z.string().optional(),
  libraries: z.array(z.string()).optional(),
  priority: z.number().optional(),
  priorityCategory: z.number().optional(),

  contents: z.array(JaclyBlockSchema).optional(),
});

export type JaclyConfig = z.infer<typeof JaclyConfigSchema>;
export type JaclyBlock = z.infer<typeof JaclyBlockSchema>;
export type JaclyBlockKindBlock = z.infer<typeof JaclyBlockKindBlock>;
export type JaclyBlocksArgs = z.infer<typeof JaclyArgs>;

export function jaclyJsonSchema() {
  return z.toJSONSchema(JaclyConfigSchema, {});
}
