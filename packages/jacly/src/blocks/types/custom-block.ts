import {
  Block,
  BlockSvg,
  FieldDropdown,
  IIcon,
  WorkspaceSvg,
} from 'blockly/core';

interface BlockExtension {
  code?: string;
  isProgramStart?: boolean;
  previousStatement?: string | null;
  nextStatement?: string | null;

  savedInstanceName?: string;
}

export interface BlockExtended extends Block, BlockExtension {}
export interface BlockSvgExtended extends BlockSvg, BlockExtension {}

export interface WorkspaceSvgExtended extends WorkspaceSvg {
  getAllBlocks: (ordered: boolean) => BlockSvgExtended[];
}

export interface IIconBlock extends IIcon {
  textMap: Map<string, string>;
}

export interface FieldDropdownExtended extends FieldDropdown {
  getSourceBlock(): BlockExtended;
}
