export interface EngineMissingPackages {
  [packageName: string]: Set<string>;
}

export interface BlockState {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  fields?: Record<string, unknown>;
  inputs?: Record<string, InputState>;
  next?: { block?: BlockState; shadow?: BlockState };
  extraState?: Record<string, unknown>;
}

export interface InputState {
  block?: BlockState;
  shadow?: BlockState;
}

export interface WorkspaceState {
  blocks?: {
    languageVersion?: number;
    blocks: BlockState[];
  };
}

export interface UnsupportedBlockExtraState {
  originalState: BlockState;
}

export interface SanitizationResult {
  state: object;
  restoredTypes: string[];
  replacedTypes: string[];
}
