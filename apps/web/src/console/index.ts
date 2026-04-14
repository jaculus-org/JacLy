export { KeyValueDisplay } from './components/key-value/key-value';
export { ConsolePanel } from './components/panels/console-panel';
export { ChartPanel } from './components/panels/plotter-panel';
export { ConsoleBusService } from './services/console-bus-service';
export { ConsoleTelemetryService } from './services/console-telemetry-service';
export { cloneHistoryMap } from './services/key-value-history';
export { parseKeyValue } from './services/kv-parser';
export type { ConsoleContextValue } from './state/console-context';
export { useConsole } from './state/console-context';
export type { ConsoleProviderProps } from './state/console-provider';
export { ConsoleProvider } from './state/console-provider';
export type {
  ConsolePlotterActions,
  ConsolePlotterContextValue,
  ConsolePlotterMeta,
  ConsolePlotterState,
} from './state/plotter-context';
export { useConsolePlotter } from './state/plotter-context';
export {
  ConsolePlotterProvider,
  type ConsolePlotterProviderProps,
} from './state/plotter-provider';
export type {
  KeyValueHistoryMap,
  KeyValueMap,
  ParsedValue,
} from './types/key-value-types';
export type { AddToConsole, ConsoleEntry, ConsoleType } from './types/types';

import { Console as ConsoleComponent } from './components/console';
import { ConsolePlotterChart } from './components/plotter/plotter-chart';
import { ConsolePlotterToolbar } from './components/plotter/plotter-toolbar';
import { ConsoleProvider } from './state/console-provider';
import { ConsolePlotterProvider } from './state/plotter-provider';

export const Console = {
  Provider: ConsoleProvider,
  Console: ConsoleComponent,
};

export const ConsolePlotter = {
  Provider: ConsolePlotterProvider,
  Chart: ConsolePlotterChart,
  Toolbar: ConsolePlotterToolbar,
};
