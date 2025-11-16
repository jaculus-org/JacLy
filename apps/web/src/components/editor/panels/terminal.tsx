import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  useTerminal,
  getStreamInfo,
  type TerminalStreamType,
} from '@/hooks/terminal-store';
import { Trash2, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

export default function TerminalPanel() {
  const terminal = useTerminal();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminal.filteredEntries]);

  const streamTypes: TerminalStreamType[] = [
    'serial-in',
    'serial-out',
    'compiler-stdout',
    'compiler-stderr',
    'runtime-stdout',
    'runtime-stderr',
    'system',
    'debug',
  ];

  const visibleCount = Object.values(terminal.visibleTypes).filter(
    Boolean
  ).length;
  const allVisible = visibleCount === streamTypes.length;
  const noneVisible = visibleCount === 0;

  const toggleAll = () => {
    const newState = !allVisible;
    streamTypes.forEach(type => {
      terminal.setTypeVisible(type, newState);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-2 border-b border-slate-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Terminal</h3>
          <span className="text-xs text-slate-500 dark:text-gray-400">
            ({terminal.filteredEntries.length} / {terminal.entries.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Filter className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Stream Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={allVisible}
                onCheckedChange={toggleAll}
                className="font-medium"
              >
                {allVisible ? 'Hide All' : 'Show All'}
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              {streamTypes.map(type => {
                const info = getStreamInfo(type);
                const isVisible = terminal.visibleTypes[type];

                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={isVisible}
                    onCheckedChange={checked =>
                      terminal.setTypeVisible(type, !!checked)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            terminal.entries.find(e => e.type === type)
                              ?.color || '#6b7280',
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm">{info.name}</span>
                        <span className="text-xs text-gray-400">
                          {info.description}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={terminal.clear}
            className="h-7 w-7 p-0"
            title="Clear terminal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-relaxed"
      >
        {terminal.filteredEntries.length === 0 ? (
          <div className="text-slate-500 dark:text-gray-500 text-center py-8">
            {noneVisible ? 'No streams selected' : 'No messages'}
          </div>
        ) : (
          terminal.filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="flex gap-2 py-0.5 hover:bg-slate-200 dark:hover:bg-gray-800/50"
            >
              <span className="text-slate-500 dark:text-gray-500 text-xs shrink-0 w-16">
                {formatTime(entry.timestamp)}
              </span>
              <span
                className="shrink-0 w-16 text-xs font-medium"
                style={{ color: entry.color }}
              >
                {getStreamInfo(entry.type).name}
              </span>
              <span className="flex-1 whitespace-pre-wrap wrap-break-word">
                {entry.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
