export { KeyValueDisplay } from './components/key-value/key-value';
export { ConsolePanel } from './console/console-panel';
export { ChartPanel } from './plotter/plotter-panel';
export { ConsoleBusService } from './services/console-bus-service';
export { ConsoleTelemetryService } from './services/console-telemetry-service';
export { cloneHistoryMap } from './services/key-value-history';
export { parseKeyValue } from './services/kv-parser';
export type { ConsoleContextValue } from './console/console-context';
export { useConsole } from './console/console-context';
export type { ConsoleProviderProps } from './console/console-provider';
export { ConsoleProvider } from './console/console-provider';
export type {
  ConsolePlotterActions,
  ConsolePlotterContextValue,
  ConsolePlotterMeta,
  ConsolePlotterState,
} from './plotter/plotter-context';
export { useConsolePlotter } from './plotter/plotter-context';
export {
  ConsolePlotterProvider,
  type ConsolePlotterProviderProps,
} from './plotter/plotter-provider';
export type {
  KeyValueHistoryMap,
  KeyValueMap,
  ParsedValue,
} from './types/key-value-types';
export type { AddToConsole, ConsoleEntry, ConsoleType } from './types/types';

import { ConsoleInput } from './console/console-input';
import { ConsoleOutput } from './console/console-output';
import { ConsoleToolbar } from './console/console-toolbar';
import { ConsolePanel } from './console/console-panel';
import { Console as ConsoleComponent } from './console/console';
import { ConsoleProvider } from './console/console-provider';
import { ConsolePlotterChart } from './plotter/plotter-chart';
import { ConsolePlotterToolbar } from './plotter/plotter-toolbar';
import { ConsolePlotterProvider } from './plotter/plotter-provider';

export const Console = {
  Provider: ConsoleProvider,
  Console: ConsoleComponent,
  Input: ConsoleInput,
  Output: ConsoleOutput,
  Toolbar: ConsoleToolbar,
  Panel: ConsolePanel,
};

export const ConsolePlotter = {
  Provider: ConsolePlotterProvider,
  Chart: ConsolePlotterChart,
  Toolbar: ConsolePlotterToolbar,
};