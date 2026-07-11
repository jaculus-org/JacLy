import { createHash } from 'node:crypto';

const RENDER_SCHEMA_VERSION = 'jacly-render-v1';

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Cannot hash a non-finite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(',')}}`;
  }
  throw new TypeError(`Cannot hash value of type ${typeof value}`);
}

export function renderHash(spec: unknown): string {
  return createHash('sha256')
    .update(RENDER_SCHEMA_VERSION)
    .update('\0')
    .update(canonicalJson(spec))
    .digest('hex');
}
