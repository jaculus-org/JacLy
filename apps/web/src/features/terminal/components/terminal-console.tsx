import { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../provider/terminal-provider';
import { sendToDeviceStr } from '@/features/jac-device/lib/connection';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
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
  Send,
  Trash2,
  Clock,
  ChevronDown,
  ChevronsDown,
  ClockFadingIcon,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Textarea } from '@/features/shared/components/ui/textarea';

export function TerminalConsole() {
  const { addEntry, consoleEntries, clear } = useTerminal();
  const { device } = useJacDevice();
  const [input, setInput] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleMessage(message: string) {
    if (!device) return;

    sendToDeviceStr(device, message + '\n', addEntry);
  }

  const handleSubmit = async () => {
    if (input.trim()) {
      await handleMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleEntries, autoScroll]);

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'console-in':
        return 'text-blue-400';
      case 'console-out':
        return 'text-green-400';
      case 'console-err':
        return 'text-red-400';
      default:
        return 'text-foreground';
    }
  };

  const handleCopyToClipboard = async () => {
    const content = consoleEntries
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
            {/* Input Section */}
            <div className="flex items-start gap-1.5">
              <Textarea
                placeholder="Type a command..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-8 flex-1 resize-none py-1.5"
                rows={1}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSubmit}
                    size="default"
                    disabled={!device}
                  >
                    <Send />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send command</p>
                </TooltipContent>
              </Tooltip>
            </div>

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
                      {showTimestamp ? 'Hide timestamps' : 'Show timestamps'}
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
                        ? 'Disable auto-scroll'
                        : 'Enable auto-scroll'}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={copied ? 'default' : 'outline'}
                      onClick={handleCopyToClipboard}
                      disabled={consoleEntries.length === 0}
                    >
                      {copied ? <Check /> : <Copy />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" onClick={clear}>
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear terminal</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Entry Count Badge */}
              <Badge variant="outline" className="ml-auto text-xs">
                {consoleEntries.length}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Terminal Output */}
        <Card className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden p-2 font-mono text-xs"
          >
            {consoleEntries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No console output yet...
              </div>
            ) : (
              <div className="space-y-0.5">
                {consoleEntries.map((entry, index) => (
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
