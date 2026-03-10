import type { KeyValueMap } from '@/features/keyValue/lib/types';
import { parseKeyValue } from '@/features/keyValue/lib/parser/kvParser';
import type { ConsoleEntry } from '@/features/console/types';

export class ConsoleTelemetryService {
  extractKeyValuePairs(entries: ConsoleEntry[]): KeyValueMap {
    return entries
      .filter(entry => entry.type === 'out' || entry.type === 'err')
      .reduce<KeyValueMap>((acc, entry) => {
        const parsed = parseKeyValue(entry.content);
        return { ...acc, ...parsed };
      }, {});
  }
}
