import type {
  RenderFormat,
  RenderLocale,
  RenderOptions,
  RenderSpec,
  RenderTheme,
} from '../shared/types.js';
import { HttpError } from './errors.js';

const DEFAULT_OPTIONS: RenderOptions = {
  theme: 'light',
  locale: 'en',
  padding: 16,
  scale: 1,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFormat(value: unknown): RenderFormat {
  if (value === undefined) return 'svg';
  if (value === 'svg' || value === 'png') return value;
  throw new HttpError(400, 'format must be "svg" or "png"');
}

function parseTheme(value: unknown): RenderTheme {
  if (value === undefined) return DEFAULT_OPTIONS.theme;
  if (value === 'light' || value === 'dark') return value;
  throw new HttpError(400, 'options.theme must be "light" or "dark"');
}

function parseLocale(value: unknown): RenderLocale {
  if (value === undefined) return DEFAULT_OPTIONS.locale;
  if (value === 'en' || value === 'cs') return value;
  throw new HttpError(400, 'options.locale must be "en" or "cs"');
}

function boundedNumber(
  value: unknown,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new HttpError(400, `${name} must be a finite number from ${minimum} to ${maximum}`);
  }
  return value;
}

function parseOptions(value: unknown): RenderOptions {
  if (value === undefined) return { ...DEFAULT_OPTIONS };
  if (!isRecord(value)) throw new HttpError(400, 'options must be an object');
  return {
    theme: parseTheme(value.theme),
    locale: parseLocale(value.locale),
    padding: boundedNumber(value.padding, DEFAULT_OPTIONS.padding, 'options.padding', 0, 128),
    scale: boundedNumber(value.scale, DEFAULT_OPTIONS.scale, 'options.scale', 0.25, 4),
  };
}

function parseWorkspace(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.blocks) || !Array.isArray(value.blocks.blocks)) {
    throw new HttpError(400, 'workspace must contain blocks.blocks as an array');
  }
  return value;
}

function parseBlockData(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.blockFiles)) {
    throw new HttpError(400, 'blockData must contain a blockFiles object');
  }
  return value;
}

export function parseRenderRequest(
  body: unknown,
  queryFormat: string | null,
  defaultBlockData: Record<string, unknown>,
): RenderSpec {
  if (!isRecord(body)) throw new HttpError(400, 'request body must be a JSON object');

  const enveloped = 'workspace' in body;
  const workspace = parseWorkspace(enveloped ? body.workspace : body);
  const blockData = parseBlockData(
    enveloped ? (body.blockData ?? defaultBlockData) : defaultBlockData,
  );
  const format = parseFormat(queryFormat ?? (enveloped ? body.format : undefined));
  const options = parseOptions(enveloped ? body.options : undefined);

  return { workspace, blockData, format, options };
}
