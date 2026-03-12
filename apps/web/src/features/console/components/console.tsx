import { m } from '@/paraglide/messages';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useConsole } from '../console-context';
import { sendToDeviceStr } from '@/features/jac-device/lib/connection';
import { useJacDevice } from '@/features/jac-device';
import { Card } from '@/features/shared/components/ui/card';
import { KeyValueDisplay } from '@/features/keyValue';
import { ConsoleInput } from './console-input';
import { ConsoleToolbar } from './console-toolbar';
import { ConsoleOutput } from './console-output';
import type { ConsoleType } from '../types';

interface ConsoleProps {
  displayKeyValue?: boolean;
  tooltipCollapsed?: boolean;
}

export function Console({
  displayKeyValue = true,
  tooltipCollapsed = false,
}: ConsoleProps) {
  const { state, actions } = useConsole();
  const {
    state: { device },
  } = useJacDevice();
  const [input, setInput] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] =
    useState(tooltipCollapsed);

  function getStreamEntryColor(type: ConsoleType): string {
    switch (type) {
      case 'in':
        return 'text-foreground';
      case 'out':
        return 'text-foreground';
      case 'err':
        return 'text-red-400';
    }
  }

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
    const content = state.entries
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
    <div className="flex h-full flex-col gap-1.5 p-1.5">
      <Card className="p-1.5">
        {isToolbarCollapsed ? (
          <ConsoleInput
            input={input}
            disabled={!device}
            onChange={setInput}
            onSubmit={handleSubmit}
            onExpand={() => setIsToolbarCollapsed(false)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <ConsoleToolbar
            input={input}
            disabled={!device}
            entryCount={state.entries.length}
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

      {displayKeyValue && <KeyValueDisplay />}

      <ConsoleOutput
        entries={state.entries}
        emptyMessage={m.terminal_console_empty()}
        showTimestamp={showTimestamp}
        autoScroll={autoScroll}
        getEntryColor={getStreamEntryColor}
      />
    </div>
  );
}
