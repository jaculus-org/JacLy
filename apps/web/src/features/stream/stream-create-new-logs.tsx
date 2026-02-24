import { m } from '@/paraglide/messages';
import type { StreamBusService } from '@/services/stream-bus-service';
import { useEffect, useMemo, useState } from 'react';
import { getStreamEntryColor, isLogStream, type StreamEntry } from './types';
import { Card } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { StreamOutput } from './stream-output';

interface StreamCreateNewLogsProps {
  streamBusService: StreamBusService;
  channel?: string;
}

export function StreamCreateNewLogs({
  streamBusService,
  channel = 'global:new-project',
}: StreamCreateNewLogsProps) {
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [autoScroll] = useState(true);

  useEffect(() => {
    return streamBusService.subscribe(channel, setEntries);
  }, [streamBusService, channel]);

  const filtered = useMemo(
    () => entries.filter(entry => isLogStream(entry.type)),
    [entries]
  );

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Project creation logs</h3>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => streamBusService.clear(channel)}
            className="ml-auto"
          >
            <Trash2 />
          </Button>
        </div>
      </Card>

      <div className="h-48">
        <StreamOutput
          entries={filtered}
          emptyMessage={m.terminal_logs_empty()}
          showTimestamp={false}
          autoScroll={autoScroll}
          getEntryColor={getStreamEntryColor}
        />
      </div>
    </div>
  );
}
