export { useConsole } from './state/console-context';
export type { ConsoleContextValue } from './state/console-context';
export { ConsoleProvider } from './state/console-provider';
export type { ConsoleProviderProps } from './state/console-provider';
export type { AddToConsole, ConsoleEntry, ConsoleType } from './types/types';

export { useConsolePlotter } from './state/plotter-context';
export type {
  ConsolePlotterActions,
  ConsolePlotterContextValue,
  ConsolePlotterMeta,
  ConsolePlotterState,
} from './state/plotter-context';
export {
  ConsolePlotterProvider,
  type ConsolePlotterProviderProps,
} from './state/plotter-provider';

export { KeyValueDisplay } from './components/key-value/key-value';
export { parseKeyValue } from './services/kv-parser';
export { cloneHistoryMap } from './services/key-value-history';
export type {
  KeyValueHistoryMap,
  KeyValueMap,
  ParsedValue,
} from './types/key-value-types';

export { ConsoleBusService } from './services/console-bus-service';
export { ConsoleTelemetryService } from './services/console-telemetry-service';

export { ConsolePanel } from './components/panels/console-panel';
export { ChartPanel } from './components/panels/plotter-panel';

import { ConsoleProvider } from './state/console-provider';
import { Console as ConsoleComponent } from './components/console';
import { ConsolePlotterProvider } from './state/plotter-provider';
import { ConsolePlotterChart } from './components/plotter/plotter-chart';
import { ConsolePlotterToolbar } from './components/plotter/plotter-toolbar';

export const Console = {
  Provider: ConsoleProvider,
  Console: ConsoleComponent,
};

export const ConsolePlotter = {
  Provider: ConsolePlotterProvider,
  Chart: ConsolePlotterChart,
  Toolbar: ConsolePlotterToolbar,
};
