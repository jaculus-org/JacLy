import listsConfig from './lists.jacly.json';
import logicConfig from './logic.jacly.json';
import loopsConfig from './loops.jacly.json';
import mathConfig from './math.jacly.json';
import proceduresConfig from './procedures.jacly.json';
import textConfig from './text.jacly.json';
import variablesConfig from './variables.jacly.json';

export const metaBlocks = {
  'lists.jacly.json': listsConfig,
  'logic.jacly.json': logicConfig,
  'loops.jacly.json': loopsConfig,
  'math.jacly.json': mathConfig,
  'procedures.jacly.json': proceduresConfig,
  'text.jacly.json': textConfig,
  'variables.jacly.json': variablesConfig,
} as const;

export type MetaBlocksType = typeof metaBlocks;
