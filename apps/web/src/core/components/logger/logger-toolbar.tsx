import {
  Check,
  ChevronDown,
  ChevronsDown,
  Clock,
  ClockFadingIcon,
  Copy,
  Trash2,
} from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Badge } from '@/ui/components/badge';
import { Button } from '@/ui/components/button';
import { Card } from '@/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/tooltip';
import { LOG_LEVELS, type LoggerEntry, type LogLevel } from './logger-types';

interface LoggerToolbarProps {
  filteredEntries: LoggerEntry[];
  selectedLevel: LogLevel;
  showTimestamp: boolean;
  autoScroll: boolean;
  copied: boolean;
  logLevelSelector?: boolean;
  onSelectLevel: (level: LogLevel) => void;
  onToggleTimestamp: () => void;
  onToggleAutoscroll: () => void;
  onCopy: () => void;
  onClear: () => void;
}

export function LoggerToolbar({
  filteredEntries,
  selectedLevel,
  showTimestamp,
  autoScroll,
  copied,
  logLevelSelector = true,
  onSelectLevel,
  onToggleTimestamp,
  onToggleAutoscroll,
  onCopy,
  onClear,
}: LoggerToolbarProps) {
  return (
    <Card className="p-1.5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showTimestamp ? 'default' : 'outline'} onClick={onToggleTimestamp}>
                  {showTimestamp ? <Clock /> : <ClockFadingIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showTimestamp ? m.terminal_timestamp_hide() : m.terminal_timestamp_show()}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={autoScroll ? 'default' : 'outline'} onClick={onToggleAutoscroll}>
                  {autoScroll ? <ChevronsDown /> : <ChevronDown />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {autoScroll ? m.terminal_autoscroll_disable() : m.terminal_autoscroll_enable()}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={copied ? 'default' : 'outline'}
                  onClick={onCopy}
                  disabled={filteredEntries.length === 0}
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

          <div className="ml-auto flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {filteredEntries.length}
            </Badge>
            {logLevelSelector && (
              <Select value={selectedLevel} onValueChange={(v) => onSelectLevel(v as LogLevel)}>
                <SelectTrigger className="h-7 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="text-xs">
                      <span className="uppercase">{level}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}