import { m } from '@/paraglide/messages';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { Card } from '@/features/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip';
import {
  Trash2,
  Clock,
  ChevronDown,
  ChevronsDown,
  ClockFadingIcon,
  Copy,
  Check,
} from 'lucide-react';
import { getStreamScope, type StreamEntry, type StreamLogKey } from './types';

interface StreamLogsToolbarProps {
  logEntries: StreamEntry[];
  logKeys: ReadonlyArray<StreamLogKey>;
  selectedLogType: StreamLogKey;
  showTimestamp: boolean;
  autoScroll: boolean;
  copied: boolean;
  onSelectType: (type: StreamLogKey) => void;
  onToggleTimestamp: () => void;
  onToggleAutoscroll: () => void;
  onCopy: () => void;
  onClear: () => void;
}

export function StreamLogsToolbar({
  logEntries,
  logKeys,
  selectedLogType,
  showTimestamp,
  autoScroll,
  copied,
  onSelectType,
  onToggleTimestamp,
  onToggleAutoscroll,
  onCopy,
  onClear,
}: StreamLogsToolbarProps) {
  const streamLabelByKey: Record<StreamLogKey, string> = {
    compiler: m.stream_scope_compiler(),
    runtime: m.stream_scope_runtime(),
    debug: m.stream_scope_debug(),
  };

  const entryCountByKey = logKeys.reduce<Record<StreamLogKey, number>>(
    (acc, key) => {
      acc[key] = logEntries.filter(
        entry => getStreamScope(entry.type) === key
      ).length;
      return acc;
    },
    {} as Record<StreamLogKey, number>
  );

  return (
    <Card className="p-1.5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showTimestamp ? 'default' : 'outline'}
                  onClick={onToggleTimestamp}
                >
                  {showTimestamp ? <Clock /> : <ClockFadingIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {showTimestamp
                    ? m.terminal_timestamp_hide()
                    : m.terminal_timestamp_show()}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={autoScroll ? 'default' : 'outline'}
                  onClick={onToggleAutoscroll}
                >
                  {autoScroll ? <ChevronsDown /> : <ChevronDown />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {autoScroll
                    ? m.terminal_autoscroll_disable()
                    : m.terminal_autoscroll_enable()}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={copied ? 'default' : 'outline'}
                  onClick={onCopy}
                  disabled={logEntries.length === 0}
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? m.terminal_copied() : m.terminal_copy()}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" onClick={onClear}>
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{m.terminal_clear()}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ButtonGroup className="ml-auto w-full sm:w-auto flex-wrap justify-end">
            {logKeys.map(key => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedLogType === key ? 'default' : 'outline'}
                    onClick={() => onSelectType(key)}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <span className="uppercase">
                      {streamLabelByKey[key].slice(0, 3)}
                    </span>
                    {entryCountByKey[key] > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 text-[10px] px-1.5"
                      >
                        {entryCountByKey[key]}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{streamLabelByKey[key]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ButtonGroup>
        </div>
      </div>
    </Card>
  );
}
