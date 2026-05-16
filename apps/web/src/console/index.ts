export type { ConsoleContextValue } from './console/console-context';
export { useConsole } from './console/console-context';
export { ConsolePanel } from './console/console-panel';
export type { ConsoleProviderProps } from './console/console-provider';
export { ConsoleProvider } from './console/console-provider';
export { KeyValueDisplay } from './key-value/key-value';
export { cloneHistoryMap } from './key-value/key-value-history';
export { parseKeyValue } from './key-value/key-value-parser';
export type {
  KeyValueHistoryMap,
  KeyValueMap,
  ParsedValue,
} from './key-value/key-value-types';
export type {
  ConsolePlotterActions,
  ConsolePlotterContextValue,
  ConsolePlotterMeta,
  ConsolePlotterState,
} from './plotter/plotter-context';
export { useConsolePlotter } from './plotter/plotter-context';
export { ChartPanel } from './plotter/plotter-panel';
export {
  ConsolePlotterProvider,
  type ConsolePlotterProviderProps,
} from './plotter/plotter-provider';
export { ConsoleBusService } from './services/console-bus-service';
export { ConsoleTelemetryService } from './services/console-telemetry-service';
export type { AddToConsole, ConsoleEntry, ConsoleType } from './types/types';

import { Console as ConsoleComponent } from './console/console';
import { ConsoleInput } from './console/console-input';
import { ConsoleOutput } from './console/console-output';
import { ConsolePanel } from './console/console-panel';
import { ConsoleProvider } from './console/console-provider';
import { ConsoleToolbar } from './console/console-toolbar';
import { ConsolePlotterChart } from './plotter/plotter-chart';
import { ConsolePlotterProvider } from './plotter/plotter-provider';
import { ConsolePlotterToolbar } from './plotter/plotter-toolbar';

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
