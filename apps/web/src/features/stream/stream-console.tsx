import { m } from '@/paraglide/messages';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useStream } from './stream-context';
import { sendToDeviceStr } from '@/features/jac-device/lib/connection';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import { Card } from '@/features/shared/components/ui/card';
import { TooltipProvider } from '@/features/shared/components/ui/tooltip';
import { KeyValueDisplay } from '@/features/keyValue/components/keyValue';
import { getStreamEntryColor } from './types';
import { StreamConsoleInput } from './stream-console-input';
import { StreamConsoleToolbar } from './stream-console-toolbar';
import { StreamOutput } from './stream-output';

interface StreamConsoleProps {
  tooltipCollapsed?: boolean;
}

export function StreamConsole({
  tooltipCollapsed = false,
}: StreamConsoleProps) {
  const { state, actions } = useStream();
  const { device } = useJacDevice();
  const [input, setInput] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] =
    useState(tooltipCollapsed);

  async function handleMessage(message: string) {
    if (!device) return;
    sendToDeviceStr(device, message + '\n', actions.addEntry);
  }

  const handleSubmit = async () => {
    if (input.trim()) {
      await handleMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyToClipboard = async () => {
    const content = state.consoleEntries
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
        <Card className="p-1.5">
          {isToolbarCollapsed ? (
            <StreamConsoleInput
              input={input}
              disabled={!device}
              onChange={setInput}
              onSubmit={handleSubmit}
              onExpand={() => setIsToolbarCollapsed(false)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <StreamConsoleToolbar
              input={input}
              disabled={!device}
              entryCount={state.consoleEntries.length}
              showTimestamp={showTimestamp}
              autoScroll={autoScroll}
              copied={copied}
              onChangeInput={setInput}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              onCollapse={() => setIsToolbarCollapsed(true)}
              onToggleTimestamp={() => setShowTimestamp(v => !v)}
              onToggleAutoscroll={() => setAutoScroll(v => !v)}
              onCopy={handleCopyToClipboard}
              onClear={actions.clear}
            />
          )}
        </Card>

        <KeyValueDisplay />

        <StreamOutput
          entries={state.consoleEntries}
          emptyMessage={m.terminal_console_empty()}
          showTimestamp={showTimestamp}
          autoScroll={autoScroll}
          getEntryColor={getStreamEntryColor}
        />
      </div>
    </TooltipProvider>
  );
}
