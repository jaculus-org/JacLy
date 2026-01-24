import { m } from '@/paraglide/messages';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  logKeys,
  useTerminal,
  type TerminalStreamType,
} from '../provider/terminal-provider';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
import { cn } from '@/lib/utils/cn';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';

export function TerminalLogs() {
  const { logEntries, clear } = useTerminal();
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState<string>(logKeys[0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(() => {
    return logEntries.filter(entry => entry.type.startsWith(selectedLogType));
  }, [logEntries, selectedLogType]);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logEntries, autoScroll]);

  const getEntryColor = (type: Partial<TerminalStreamType>) => {
    switch (type) {
      case 'compiler-stdout':
        return 'text-blue-400';
      case 'compiler-stderr':
        return 'text-yellow-400';
      case 'runtime-stdout':
        return 'text-green-400';
      case 'runtime-stderr':
        return 'text-red-400';
      default:
        return 'text-foreground';
    }
  };

  const handleCopyToClipboard = async () => {
    const content = filteredEntries
      .map(entry => {
        const timestamp = showTimestamp
          ? `[${entry.timestamp.toLocaleTimeString()}] `
          : '';
        return `${timestamp}${entry.content}`;
      })
      .join('');

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col gap-1.5 p-1.5">
        {/* Toolbar */}
        <Card className="p-1.5">
          <div className="flex flex-col gap-1.5">
            {/* Control Buttons Row */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showTimestamp ? 'default' : 'outline'}
                      onClick={() => setShowTimestamp(!showTimestamp)}
                    >
                      {showTimestamp ? <Clock /> : <ClockFadingIcon />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {showTimestamp ? m.terminal_timestamp_hide() : m.terminal_timestamp_show()}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={autoScroll ? 'default' : 'outline'}
                      onClick={() => setAutoScroll(!autoScroll)}
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
                      onClick={handleCopyToClipboard}
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
                    <Button variant="destructive" onClick={clear}>
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{m.terminal_clear()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* align right to side */}
              <ButtonGroup className="ml-auto">
                {logKeys.map(key => (
                  <Button
                    key={key}
                    variant={selectedLogType === key ? 'default' : 'outline'}
                    onClick={() => setSelectedLogType(key)}
                  >
                    {/* first letter uppercase */}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {logEntries.filter(entry => entry.type === key).length >
                      0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {logEntries.filter(entry => entry.type === key).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </div>
        </Card>

        {/* Terminal Output */}
        <Card className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden p-2 font-mono text-xs"
          >
            {filteredEntries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {m.terminal_logs_empty()}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredEntries.map((entry, index) => (
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
      </div>
    </TooltipProvider>
  );
}
