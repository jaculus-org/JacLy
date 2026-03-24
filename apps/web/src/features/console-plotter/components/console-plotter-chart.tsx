import { Card } from '@/features/shared/components/ui/card';
import { useJacDevice } from '@/features/jac-device';
import {
  cloneHistoryMap,
  type KeyValueHistoryMap,
  type ParsedValue,
} from '@/features/keyValue';
import { m } from '@/paraglide/messages';
import 'chartjs-adapter-luxon';
import {
  Chart,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
  type Point,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import {
  RealTimeScale,
  StreamingPlugin,
} from '@aziham/chartjs-plugin-streaming';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useConsolePlotter } from '../console-plotter-context';

Chart.register(
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  RealTimeScale,
  StreamingPlugin,
  Tooltip
);

const DATASET_COLORS = [
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#ca8a04',
  '#db2777',
];
const STREAMING_DELAY_MS = 100;
type PlotterChart = Chart<'line', (number | Point | null)[], unknown>;
type PlotterDataset = ChartDataset<'line', { x: number; y: number }[]>;

interface PausedChartSnapshot {
  history: KeyValueHistoryMap;
  pausedAt: number | null;
}

function toFillColor(color: string): string {
  return `${color}22`;
}

function createDataset(
  key: string,
  color: string,
  points: ParsedValue[]
): PlotterDataset {
  return {
    label: key,
    data: points.map(point => ({
      x: point.timestamp,
      y: point.value,
    })),
    borderColor: color,
    backgroundColor: toFillColor(color),
    fill: true,
    borderWidth: 2,
    cubicInterpolationMode: 'monotone' as const,
    pointRadius: 0,
    tension: 0.28,
  };
}

function getChartWindow(
  durationMs: number,
  pausedAt: number | null,
  isPaused: boolean
) {
  const end =
    (isPaused ? (pausedAt ?? Date.now()) : Date.now()) - STREAMING_DELAY_MS;
  return {
    end,
    start: end - durationMs,
  };
}

function getVisiblePoints(
  history: KeyValueHistoryMap,
  key: string,
  durationMs: number,
  pausedAt: number | null,
  isPaused: boolean
) {
  const chartWindow = getChartWindow(durationMs, pausedAt, isPaused);
  return (history[key] ?? []).filter(
    point =>
      point.timestamp >= chartWindow.start && point.timestamp <= chartWindow.end
  );
}

function syncDatasets(
  chart: PlotterChart,
  history: KeyValueHistoryMap,
  selectedKeys: string[],
  durationMs: number,
  pausedAt: number | null,
  isPaused: boolean
) {
  chart.data.datasets = selectedKeys.map((key, index) =>
    createDataset(
      key,
      DATASET_COLORS[index % DATASET_COLORS.length],
      getVisiblePoints(history, key, durationMs, pausedAt, isPaused)
    )
  );
}

export const ConsolePlotterChart = memo(function ConsolePlotterChart() {
  const { state, meta } = useConsolePlotter();
  const {
    state: { connectionStatus },
  } = useJacDevice();
  const chartRef = useRef<PlotterChart | undefined>(undefined);
  const historyRef = useRef(state.history);
  const selectedKeysRef = useRef(state.selectedKeys);
  const lastRenderedTimestampsRef = useRef<Record<string, number>>({});
  const pausedSelectionSignatureRef = useRef<string | null>(null);
  const isChartPaused = state.paused || connectionStatus !== 'connected';
  const [pausedSnapshot, setPausedSnapshot] = useState<PausedChartSnapshot>(
    () => ({
      history: cloneHistoryMap(state.history),
      pausedAt: null as number | null,
    })
  );
  const data = useMemo<ChartData<'line'>>(
    () => ({
      datasets: [],
    }),
    []
  );

  useEffect(() => {
    historyRef.current = state.history;
  }, [state.history]);

  useEffect(() => {
    if (isChartPaused) {
      setPausedSnapshot({
        history: cloneHistoryMap(historyRef.current),
        pausedAt: Date.now(),
      });
      pausedSelectionSignatureRef.current = null;
      return;
    }

    setPausedSnapshot(current =>
      current.pausedAt === null ? current : { ...current, pausedAt: null }
    );
    pausedSelectionSignatureRef.current = null;
  }, [isChartPaused]);

  useEffect(() => {
    selectedKeysRef.current = state.selectedKeys;
  }, [state.selectedKeys]);

  const refreshChart = useCallback((chart: PlotterChart) => {
    for (const dataset of chart.data.datasets) {
      const key = String(dataset.label ?? '');
      if (!selectedKeysRef.current.includes(key)) {
        continue;
      }

      const history = historyRef.current[key] ?? [];
      const lastRenderedTimestamp = lastRenderedTimestampsRef.current[key] ?? 0;
      const pendingPoints = history.filter(
        point => point.timestamp > lastRenderedTimestamp
      );

      if (pendingPoints.length === 0) {
        continue;
      }

      const datasetPoints = dataset.data as Array<{ x: number; y: number }>;

      for (const point of pendingPoints) {
        datasetPoints.push({
          x: point.timestamp,
          y: point.value,
        });
      }

      lastRenderedTimestampsRef.current[key] =
        pendingPoints[pendingPoints.length - 1].timestamp;
    }
  }, []);

  const availableKeySignature = useMemo(
    () => state.availableKeys.join('|'),
    [state.availableKeys]
  );
  const selectedKeySignature = useMemo(
    () => state.selectedKeys.join('|'),
    [state.selectedKeys]
  );

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    if (isChartPaused) {
      const pausedSelectionSignature = `${availableKeySignature}|${selectedKeySignature}`;
      if (pausedSelectionSignatureRef.current === pausedSelectionSignature) {
        return;
      }
      pausedSelectionSignatureRef.current = pausedSelectionSignature;
    } else {
      pausedSelectionSignatureRef.current = null;
    }

    const sourceHistory = isChartPaused
      ? pausedSnapshot.history
      : historyRef.current;
    syncDatasets(
      chart,
      sourceHistory,
      state.selectedKeys,
      meta.durationMs,
      pausedSnapshot.pausedAt,
      isChartPaused
    );

    lastRenderedTimestampsRef.current = Object.fromEntries(
      state.selectedKeys.map(key => [
        key,
        sourceHistory[key]?.[sourceHistory[key].length - 1]?.timestamp ?? 0,
      ])
    );

    chart.update('none');
  }, [
    availableKeySignature,
    isChartPaused,
    meta.durationMs,
    pausedSnapshot,
    selectedKeySignature,
    state.selectedKeys,
  ]);

  const options: ChartOptions<'line'> = {
    animation: false,
    maintainAspectRatio: false,
    normalized: true,
    parsing: false,
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: STREAMING_DELAY_MS,
          duration: meta.durationMs,
          frameRate: 30,
          onRefresh: refreshChart,
          pause: isChartPaused,
          refresh: 250,
          ttl: meta.durationMs + STREAMING_DELAY_MS,
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      } as never,
      y: {
        grace: '5%',
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
        },
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
  };

  if (state.availableKeys.length === 0) {
    return (
      <Card className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
        {m.chart_panel_empty()}
      </Card>
    );
  }

  if (state.selectedKeys.length === 0) {
    return (
      <Card className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
        {m.chart_panel_empty_selection()}
      </Card>
    );
  }

  return (
    <Card className="flex min-h-0 flex-1 p-2">
      <div className="min-h-[260px] flex-1">
        <Line
          data={data}
          options={options}
          ref={chart => {
            chartRef.current = chart ?? undefined;
          }}
        />
      </div>
    </Card>
  );
});
