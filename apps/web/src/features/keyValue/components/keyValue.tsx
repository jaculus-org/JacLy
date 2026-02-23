import * as React from 'react';
import { useState, useMemo } from 'react';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { Separator } from '@/features/shared/components/ui/separator';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { ChevronDown, ChevronUp, Trash2Icon } from 'lucide-react';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip';
import { m } from '@/paraglide/messages';

type SortMode = 'alpha' | 'time';

export function KeyValueDisplay() {
  const { keyValueEntries, clear } = useTerminal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>('time');

  const entries = useMemo(() => {
    const all = Object.entries(keyValueEntries);
    if (sortBy === 'alpha') {
      return all.sort(([a], [b]) => a.localeCompare(b));
    }
    // time: newest first
    return all.sort(([, a], [, b]) => b.timestamp - a.timestamp);
  }, [keyValueEntries, sortBy]);

  if (entries.length === 0) return null;

  return (
    <Card className="w-full">
      <div className="flex items-center gap-1 px-1 py-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-7 p-0"
          onClick={() => setIsCollapsed(v => !v)}
        >
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </Button>

        <span
          className="text-xs font-semibold "
          onClick={() => setIsCollapsed(v => !v)}
        >
          {m.keyvalue_component()}
          <span className="ml-1.5 text-muted-foreground font-normal">
            ({entries.length})
          </span>
        </span>

        <div className="ml-auto flex items-center gap-1.5 h-0">
          <ButtonGroup onClick={() => setIsCollapsed(false)}>
            <Button
              size="sm"
              variant={sortBy === 'alpha' ? 'default' : 'outline'}
              className="h-6 px-2 text-xs"
              onClick={() => setSortBy('alpha')}
            >
              A–Z
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'time' ? 'default' : 'outline'}
              className="h-6 px-2 text-xs"
              onClick={() => setSortBy('time')}
            >
              {m.keyvalue_sort_time()}
            </Button>
          </ButtonGroup>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-7 p-0"
                onClick={() => {
                  clear();
                }}
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{m.keyvalue_clear_tooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!isCollapsed && (
        <div
          className="overflow-y-auto border-t"
          style={{
            maxHeight: 160,
            height: Math.min(entries.length * 26 + 10, 160),
          }}
        >
          <div className="p-2">
            {entries.map(([key, kv], i) => (
              <React.Fragment key={key}>
                <div className="flex items-center justify-between py-0.5 text-xs">
                  <span className="truncate text-muted-foreground">{key}</span>
                  <span className="ml-2 shrink-0 font-mono font-medium">
                    {kv.value}
                  </span>
                </div>
                {i < entries.length - 1 && <Separator className="my-0.5" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
