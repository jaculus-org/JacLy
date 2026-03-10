import { m } from '@/paraglide/messages';
import { useMemo, useState } from 'react';
import { useLogger } from '../logger-context';
import { LOG_LEVEL_ORDER, type LogLevel } from '../types';
import { LoggerToolbar } from './logger-toolbar';
import { LoggerOutput } from './logger-output';

interface LoggerLogsProps {
  defaultLevel?: LogLevel;
  logLevelSelector?: boolean;
}

export function LoggerLogs({
  defaultLevel = 'info',
  logLevelSelector = true,
}: LoggerLogsProps) {
  const { state, actions } = useLogger();
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(defaultLevel);

  const filteredEntries = useMemo(
    () =>
      state.entries.filter(
        entry => LOG_LEVEL_ORDER[entry.level] <= LOG_LEVEL_ORDER[selectedLevel]
      ),
    [state.entries, selectedLevel]
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

  return (
    <div className="flex h-full flex-col gap-1.5 p-1.5">
      <LoggerToolbar
        entries={state.entries}
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
