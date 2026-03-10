export { useConsole } from './console-context';
export type { ConsoleContextValue } from './console-context';
export { ConsoleProvider } from './console-provider';
export type { ConsoleProviderProps } from './console-provider';
export type { AddToConsole, ConsoleEntry, ConsoleType } from './types';

import { ConsoleProvider } from './console-provider';
import { Console as ConsoleComponent } from './components/console';

export const Console = {
  Provider: ConsoleProvider,
  Console: ConsoleComponent,
};
