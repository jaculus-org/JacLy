import { m } from '@/core/paraglide/messages';
import { useJacDevice } from '@/device';
import { Card } from '@/ui/components/card';
import 'chartjs-adapter-luxon';
import type { ChartData, ChartOptions } from 'chart.js';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useConsolePlotter } from './plotter-context';
import { cloneHistoryMap } from '../key-value/key-value-history';
import {
  DATASET_COLORS,
  STREAMING_DELAY_MS,
  type PausedChartSnapshot,
  type PlotterChart,
  syncDatasets,
} from './plotter-chart-config';
import './plotter-chart-setup';

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
  const [pausedSnapshot, setPausedSnapshot] = useState<PausedChartSnapshot>(() => ({
    history: cloneHistoryMap(state.history),
    pausedAt: null as number | null,
  }));
  const data = useMemo<ChartData<'line'>>(
    () => ({
      datasets: [],
    }),
    [],
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

    setPausedSnapshot((current) =>
      current.pausedAt === null ? current : { ...current, pausedAt: null },
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
      const pendingPoints = history.filter((point) => point.timestamp > lastRenderedTimestamp);

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

      lastRenderedTimestampsRef.current[key] = pendingPoints[pendingPoints.length - 1].timestamp;
    }
  }, []);

  const availableKeySignature = useMemo(() => state.availableKeys.join('|'), [state.availableKeys]);
  const selectedKeySignature = useMemo(() => state.selectedKeys.join('|'), [state.selectedKeys]);

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

    const sourceHistory = isChartPaused ? pausedSnapshot.history : historyRef.current;
    syncDatasets(
      chart,
      sourceHistory,
      state.selectedKeys,
      meta.durationMs,
      pausedSnapshot.pausedAt,
      isChartPaused,
    );

    lastRenderedTimestampsRef.current = Object.fromEntries(
      state.selectedKeys.map((key) => [
        key,
        sourceHistory[key]?.[sourceHistory[key].length - 1]?.timestamp ?? 0,
      ]),
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
          ref={(chart) => {
            chartRef.current = chart ?? undefined;
          }}
        />
      </div>
    </Card>
  );
});