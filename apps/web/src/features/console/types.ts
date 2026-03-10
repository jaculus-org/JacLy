export type ConsoleType = 'in' | 'out' | 'err';

export interface ConsoleEntry {
  timestamp: Date;
  type: ConsoleType;
  content: string;
}

export type AddToConsole = (type: ConsoleType, content: string) => void;
