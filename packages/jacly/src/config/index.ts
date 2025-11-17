import { z } from 'zod';
import { zodToJsonSchema } from '@alcyone-labs/zod-to-json-schema';

const SemVer = z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be x.y.z');
const Url = z.url('must be a valid URL');
const Identifier = z
  .string()
  .regex(/^[a-zA-Z0-9-_]+$/, 'must be a valid identifier');

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

const JaclyArgsType = z.enum(['input_value', 'input_statement']);
const DefaultType = z.enum(['Number', 'String', 'Boolean', 'Array', 'Object']);

const JaclyArgs = z.object({
  type: JaclyArgsType,
  name: Identifier.uppercase('name must be uppercase identifier'),
  check: z.string().optional(),

  defaultType: DefaultType.optional(),
  defaultValue: z.any().optional(),
  visual: z.enum(['shadow', 'block']).optional(),
});

export const JaclyBlockSchema = z.object({
  kind: z.enum(['block', 'category', 'separator']),
  type: Identifier.nonempty('type is required'),
  message0: z.string().optional(),
  args0: z.array(JaclyArgs).optional(),
  tooltip: z.string().optional(),
  code: z.string().optional(),
  previousStatement: z.union([z.string(), z.null()]).optional(),
  nextStatement: z.union([z.string(), z.null()]).optional(),
});

export const JaclyConfigSchema = z.object({
  version: SemVer,
  author: z.string().nonempty('author is required'),
  github: Url.optional(),
  license: z.string().nonempty('license is required'),

  type: Identifier.nonempty('type is required'),
  name: Identifier.nonempty('name is required'),
  description: z.string().optional(),
  docs: z.string().optional(),
  color: BlocklyColour,
  custom: z.string().optional(),
  categorystyle: z.string().optional(),
  contents: z.array(JaclyBlockSchema).optional(),
});

export type JaclyConfig = z.infer<typeof JaclyConfigSchema>;
export type JaclyBlock = z.infer<typeof JaclyBlockSchema>;

export function jaclyJsonSchema() {
  return zodToJsonSchema(JaclyConfigSchema, 'jaculus-project');
}
