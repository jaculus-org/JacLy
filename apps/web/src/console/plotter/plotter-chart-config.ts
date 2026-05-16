import type { Chart, ChartDataset, Point } from 'chart.js';
import type { KeyValueHistoryMap, ParsedValue } from '../key-value/key-value-types';

export const DATASET_COLORS = [
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#ca8a04',
  '#db2777',
];

export const STREAMING_DELAY_MS = 100;

export type PlotterChart = Chart<'line', (number | Point | null)[], unknown>;
export type PlotterDataset = ChartDataset<'line', { x: number; y: number }[]>;

export interface PausedChartSnapshot {
  history: KeyValueHistoryMap;
  pausedAt: number | null;
}

export function toFillColor(color: string): string {
  return `${color}22`;
}

export function createDataset(key: string, color: string, points: ParsedValue[]): PlotterDataset {
  return {
    label: key,
    data: points.map((point) => ({
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

export function getChartWindow(durationMs: number, pausedAt: number | null, isPaused: boolean) {
  const end = (isPaused ? (pausedAt ?? Date.now()) : Date.now()) - STREAMING_DELAY_MS;
  return {
    end,
    start: end - durationMs,
  };
}

export function getVisiblePoints(
  history: KeyValueHistoryMap,
  key: string,
  durationMs: number,
  pausedAt: number | null,
  isPaused: boolean,
) {
  const chartWindow = getChartWindow(durationMs, pausedAt, isPaused);
  return (history[key] ?? []).filter(
    (point) => point.timestamp >= chartWindow.start && point.timestamp <= chartWindow.end,
  );
}

export function syncDatasets(
  chart: PlotterChart,
  history: KeyValueHistoryMap,
  selectedKeys: string[],
  durationMs: number,
  pausedAt: number | null,
  isPaused: boolean,
) {
  chart.data.datasets = selectedKeys.map((key, index) =>
    createDataset(
      key,
      DATASET_COLORS[index % DATASET_COLORS.length],
      getVisiblePoints(history, key, durationMs, pausedAt, isPaused),
    ),
  );
}
