import { getLocale } from '@/core/paraglide/runtime';

export interface ReleaseSummaryEntry {
  version: string;
  items: string[];
}

export interface ReleaseSummaryFile {
  en?: ReleaseSummaryEntry[];
  cs?: ReleaseSummaryEntry[];
}

export async function fetchReleaseSummary(): Promise<ReleaseSummaryEntry[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}release-summary.json?ts=${Date.now()}`, {
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = (await response.json()) as ReleaseSummaryFile;
  const entries = data[getLocale()];
  if (!Array.isArray(entries)) return [];
  return entries;
}
