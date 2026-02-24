import type { KeyValueMap } from '@/features/keyValue/lib/types';
import { parseKeyValue } from '@/features/keyValue/lib/parser/kvParser';
import type { StreamEntry } from '@/features/stream/types';

export class StreamTelemetryService {
  extractKeyValuePairs(entries: StreamEntry[]): KeyValueMap {
    return entries
      .filter(
        entry => entry.type === 'console-out' || entry.type === 'console-err'
      )
      .reduce<KeyValueMap>((acc, entry) => {
        const parsed = parseKeyValue(entry.content);
        return { ...acc, ...parsed };
      }, {});
  }
}
