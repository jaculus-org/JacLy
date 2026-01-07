import { Block } from 'blockly/core';

export interface BlockWithCode extends Block {
  code?: string;
  isProgramStart?: boolean;
  previousStatement?: string | null;
  nextStatement?: string | null;
}
