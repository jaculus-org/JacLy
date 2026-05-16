export interface ParsedValue {
  value: number;
  timestamp: number;
}

export type KeyValueMap = Record<string, ParsedValue>;
export type KeyValueHistoryMap = Record<string, ParsedValue[]>;