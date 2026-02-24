import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { Badge } from '@/features/shared/components/ui/badge';
import { Textarea } from '@/features/shared/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip';
import {
  Send,
  Trash2,
  Clock,
  ChevronDown,
  ChevronsDown,
  ClockFadingIcon,
  Copy,
  Check,
  ChevronUp,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';

interface StreamConsoleToolbarProps {
  input: string;
  disabled: boolean;
  entryCount: number;
  showTimestamp: boolean;
  autoScroll: boolean;
  copied: boolean;
  onChangeInput: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onCollapse: () => void;
  onToggleTimestamp: () => void;
  onToggleAutoscroll: () => void;
  onCopy: () => void;
  onClear: () => void;
}

export function StreamConsoleToolbar({
  input,
  disabled,
  entryCount,
  showTimestamp,
  autoScroll,
  copied,
  onChangeInput,
  onSubmit,
  onKeyDown,
  onCollapse,
  onToggleTimestamp,
  onToggleAutoscroll,
  onCopy,
  onClear,
}: StreamConsoleToolbarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-1.5">
        <Textarea
          placeholder={m.terminal_placeholder()}
          value={input}
          onChange={e => onChangeInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-8 flex-1 resize-none py-1.5"
          rows={1}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSubmit} size="default" disabled={disabled}>
              <Send />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{m.terminal_send()}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onCollapse}>
                <ChevronUp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{m.terminal_collapse()}</p>
            </TooltipContent>
          </Tooltip>

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
                disabled={entryCount === 0}
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

        <Badge variant="outline" className="ml-auto text-xs">
          {entryCount}
        </Badge>
      </div>
    </div>
  );
}
