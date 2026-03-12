import { m } from '@/paraglide/messages';
import { useMemo, useState } from 'react';
import { useLogger } from '../logger-context';
import { LOG_LEVEL_ORDER, type LogLevel, type LogOrderType } from '../types';
import { LoggerToolbar } from './logger-toolbar';
import { LoggerOutput } from './logger-output';

interface LoggerLogsProps {
  logOrderType?: LogOrderType;
  defaultLevel?: LogLevel;
  logLevelSelector?: boolean;
  hideIfEmpty?: boolean;
}

export function LoggerLogs({
  logOrderType = 'upTo',
  defaultLevel = 'info',
  logLevelSelector = true,
  hideIfEmpty = false,
}: LoggerLogsProps) {
  const { state, actions } = useLogger();
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(defaultLevel);

  const filteredEntries = useMemo(
    () =>
      state.entries.filter(entry => {
        const entryLevelOrder = LOG_LEVEL_ORDER[entry.level];
        const selectedLevelOrder = LOG_LEVEL_ORDER[selectedLevel];

        if (logOrderType === 'exact') {
          return entryLevelOrder === selectedLevelOrder;
        }

        return entryLevelOrder <= selectedLevelOrder;
      }),
    [state.entries, selectedLevel, logOrderType]
  );

  const handleCopyToClipboard = async () => {
    const content = filteredEntries
      .map(entry => {
        const timestamp = showTimestamp
          ? `[${entry.timestamp.toLocaleTimeString()}] `
          : '';
        return `${timestamp}[${entry.level.toUpperCase()}] ${entry.content}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (hideIfEmpty && filteredEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-1.5 p-1.5">
      <LoggerToolbar
        filteredEntries={filteredEntries}
        selectedLevel={selectedLevel}
        showTimestamp={showTimestamp}
        autoScroll={autoScroll}
        copied={copied}
        logLevelSelector={logLevelSelector}
        onSelectLevel={setSelectedLevel}
        onToggleTimestamp={() => setShowTimestamp(v => !v)}
        onToggleAutoscroll={() => setAutoScroll(v => !v)}
        onCopy={handleCopyToClipboard}
        onClear={actions.clear}
      />

      <LoggerOutput
        entries={filteredEntries}
        emptyMessage={m.terminal_logs_empty()}
        showTimestamp={showTimestamp}
        autoScroll={autoScroll}
      />
    </div>
  );
}
