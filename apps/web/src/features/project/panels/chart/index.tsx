import { ConsolePlotter } from '@/features/console-plotter';

export function ChartPanel() {
  return (
    <ConsolePlotter.Provider>
      <div className="flex h-full min-h-0 flex-col gap-1.5 p-1.5">
        <ConsolePlotter.Toolbar />
        <ConsolePlotter.Chart />
      </div>
    </ConsolePlotter.Provider>
  );
}
