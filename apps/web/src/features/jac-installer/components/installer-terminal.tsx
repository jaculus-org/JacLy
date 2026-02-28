import { useEffect, useRef } from 'react';
import { m } from '@/paraglide/messages';
import { Field, FieldLabel } from '@/features/shared/components/ui/field';
import { ScrollArea } from '@/features/shared/components/ui/scroll-area';
import { useInstaller } from '../installer-context';

export function InstallerTerminal() {
  const { state } = useInstaller();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = endRef.current;
    if (!node) return;
    const id = window.setTimeout(() => {
      node.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(id);
  }, [state.terminalOutput]);

  return (
    <Field>
      <FieldLabel htmlFor="terminal-output">
        {m.installer_terminal_label()}
      </FieldLabel>
      <ScrollArea
        className="h-46 w-full rounded-md border border-gray-700"
        id="terminal-output"
      >
        <div className="bg-secondary text-green-400 font-mono text-sm p-4">
          {state.terminalOutput.length === 0 ? (
            <div className="text-gray-500">{m.installer_terminal_empty()}</div>
          ) : (
            state.terminalOutput.map((line, index) => (
              <div key={index}>{line}</div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </Field>
  );
}
