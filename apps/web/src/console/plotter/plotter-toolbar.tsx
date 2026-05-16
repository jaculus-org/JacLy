import { CheckCheck, Pause, Play, Trash2, X } from 'lucide-react';
import { memo } from 'react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { Card } from '@/ui/components/card';
import { useConsolePlotter } from './plotter-context';

function formatValue(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2).replace(/\.?0+$/, '');
}

export const ConsolePlotterToolbar = memo(function ConsolePlotterToolbar() {
  const { state, actions } = useConsolePlotter();

  return (
    <Card className="gap-2 p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={state.paused ? 'outline' : 'default'}
          className="h-7 px-2"
          onClick={actions.togglePause}
        >
          {state.paused ? <Play /> : <Pause />}
          {state.paused ? m.chart_panel_resume() : m.chart_panel_pause()}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          onClick={actions.selectAll}
          disabled={state.availableKeys.length === 0}
        >
          <CheckCheck />
          {m.chart_panel_select_all()}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          onClick={actions.clearSelection}
          disabled={state.selectedKeys.length === 0}
        >
          <X />
          {m.chart_panel_clear_selection()}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          className="ml-auto h-7 px-2"
          onClick={actions.clearConsole}
          disabled={state.availableKeys.length === 0}
        >
          <Trash2 />
          {m.chart_panel_clear_console()}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {state.availableKeys.map((key) => {
          const isSelected = state.selectedKeys.includes(key);
          const latestValue = state.latestEntries[key]?.value;

          return (
            <Button
              key={key}
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              className="h-7 gap-1.5 px-2 font-mono text-xs"
              onClick={() => actions.toggleSeries(key)}
            >
              <span>{key}</span>
              {latestValue !== undefined && (
                <span className="text-[10px] opacity-80">{formatValue(latestValue)}</span>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
});