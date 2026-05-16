import { ConsolePlotterChart } from './plotter-chart';
import { ConsolePlotterProvider } from './plotter-provider';
import { ConsolePlotterToolbar } from './plotter-toolbar';

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
