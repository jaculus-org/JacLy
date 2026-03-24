export { useConsolePlotter } from './console-plotter-context';
export type {
  ConsolePlotterActions,
  ConsolePlotterContextValue,
  ConsolePlotterMeta,
  ConsolePlotterState,
} from './console-plotter-context';
export {
  ConsolePlotterProvider,
  type ConsolePlotterProviderProps,
} from './console-plotter-provider';
export { ConsolePlotterChart } from './components/console-plotter-chart';
export { ConsolePlotterToolbar } from './components/console-plotter-toolbar';

import { ConsolePlotterChart } from './components/console-plotter-chart';
import { ConsolePlotterToolbar } from './components/console-plotter-toolbar';
import { ConsolePlotterProvider } from './console-plotter-provider';

export const ConsolePlotter = {
  Provider: ConsolePlotterProvider,
  Chart: ConsolePlotterChart,
  Toolbar: ConsolePlotterToolbar,
};
