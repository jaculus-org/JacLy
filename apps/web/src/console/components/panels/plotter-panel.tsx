import { ConsolePlotterProvider } from '../../state/plotter-provider';
import { ConsolePlotterChart } from '../plotter/plotter-chart';
import { ConsolePlotterToolbar } from '../plotter/plotter-toolbar';

export function ChartPanel() {
  return (
    <ConsolePlotterProvider>
      <div className="flex h-full min-h-0 flex-col gap-1.5 p-1.5">
        <ConsolePlotterToolbar />
        <ConsolePlotterChart />
      </div>
    </ConsolePlotterProvider>
  );
}
