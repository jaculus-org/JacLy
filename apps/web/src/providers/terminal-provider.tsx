import React from 'react';
import { TerminalContext, useTerminalStore } from '@/hooks/terminal-store';

export const TerminalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const terminalState = useTerminalStore();

  return (
    <TerminalContext.Provider value={terminalState}>
      {children}
    </TerminalContext.Provider>
  );
};
