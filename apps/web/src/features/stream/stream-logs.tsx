import { m } from '@/paraglide/messages';
import { useMemo, useState } from 'react';
import { useStream } from './stream-context';
import {
  getStreamEntryColor,
  getStreamScope,
  type StreamLogKey,
} from './types';
import { TooltipProvider } from '@/features/shared/components/ui/tooltip';
import { StreamLogsToolbar } from './stream-logs-toolbar';
import { StreamOutput } from './stream-output';

export function StreamLogs() {
  const { state, actions, meta } = useStream();
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState<StreamLogKey>(
    meta.logKeys[0]
  );

  const filteredEntries = useMemo(
    () =>
      state.logEntries.filter(
        entry => getStreamScope(entry.type) === selectedLogType
      ),
    [state.logEntries, selectedLogType]
  );

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
        <StreamLogsToolbar
          logEntries={state.logEntries}
          selectedLogType={selectedLogType}
          showTimestamp={showTimestamp}
          autoScroll={autoScroll}
          copied={copied}
          logKeys={meta.logKeys}
          onSelectType={setSelectedLogType}
          onToggleTimestamp={() => setShowTimestamp(v => !v)}
          onToggleAutoscroll={() => setAutoScroll(v => !v)}
          onCopy={handleCopyToClipboard}
          onClear={actions.clear}
        />

        <StreamOutput
          entries={filteredEntries}
          emptyMessage={m.terminal_logs_empty()}
          showTimestamp={showTimestamp}
          autoScroll={autoScroll}
          getEntryColor={getStreamEntryColor}
        />
      </div>
    </TooltipProvider>
  );
}
