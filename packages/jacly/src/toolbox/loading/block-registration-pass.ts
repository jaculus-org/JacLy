import { registerBlocklyBlock } from '@/blocks/registration/register-block';
import { registerCodeGenerator } from '@/codegen/generators/register-code-generator';
import type { JaclyBlock, JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';

// full definition = has message0, args0, or code. alias = type only, defined elsewhere.
// examples need registration too because they drop real blocks into the toolbox by type.
export function isFullDefinition(item: Extract<JaclyBlock, { kind: 'block' }>): boolean {
  return item.message0 !== undefined || item.args0 !== undefined || item.code !== undefined;
}

export function registerFullBlocks(state: EngineState, jaclyConfig: JaclyConfig): void {
  if (!jaclyConfig.contents) return;
  for (const item of jaclyConfig.contents) {
    if (item.kind !== 'block') continue;
    if (isFullDefinition(item)) {
      registerBlocklyBlock(state, item, jaclyConfig);
      registerCodeGenerator(state, item);
    }
  }
}
