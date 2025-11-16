import { z } from 'zod';
import { zodToJsonSchema } from '@alcyone-labs/zod-to-json-schema';
// import * as Blockly from 'blockly';

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

export const JaclyBlockSchema = z.object({
  //   name: Identifier.nonempty('block name is required'),
  //   message: z.string().min(2).max(500),
  //   tooltip: z.string().min(2).max(500),
  //   previousStatement: z.string().min(2).max(100).optional(),
  //   nextStatement: z.string().min(2).max(100).optional(),
  //   args: z.array(JaclyArgumentSchema).min(1),
  //   code: z.string().min(2).max(500),
  kind: z.enum(['block', 'category', 'separator']),
  type: Identifier.nonempty('type is required'),
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
