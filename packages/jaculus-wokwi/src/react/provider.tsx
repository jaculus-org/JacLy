import type { ReactNode } from 'react';
import { WokwiSimulatorContext } from './context';

interface WokwiSimulatorProviderProps {
  hasDevice: boolean;
  isWokwiConnection: boolean;
  isInitializing: boolean;
  children: ReactNode;
}

export function WokwiSimulatorProvider({
  hasDevice,
  isWokwiConnection,
  isInitializing,
  children,
}: WokwiSimulatorProviderProps) {
  return (
    <WokwiSimulatorContext.Provider
      value={{
        state: { hasDevice, isWokwiConnection, isInitializing },
      }}
    >
      {children}
    </WokwiSimulatorContext.Provider>
  );
}
