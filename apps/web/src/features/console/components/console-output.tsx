import { Card } from '@/features/shared/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useEffect, useRef } from 'react';
import type { ConsoleEntry, ConsoleType } from '../types';

interface ConsoleOutputProps {
  entries: ConsoleEntry[];
  emptyMessage: string;
  showTimestamp: boolean;
  autoScroll: boolean;
  getEntryColor: (type: ConsoleType) => string;
}

export function ConsoleOutput({
  entries,
  emptyMessage,
  showTimestamp,
  autoScroll,
  getEntryColor,
}: ConsoleOutputProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, autoScroll]);

  return (
    <Card className="flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden p-2 font-mono text-xs"
      >
        {entries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-0.5">
            {entries.map((entry, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-1.5 leading-tight',
                  getEntryColor(entry.type)
                )}
              >
                {showTimestamp && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    [{entry.timestamp.toLocaleTimeString()}]
                  </span>
                )}
                <span className="break-all">{entry.content}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </Card>
  );
}
