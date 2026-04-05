import type { ReactNode } from 'react';
import { useJacDevice } from '@/device';
import { WokwiSimulatorContext } from './simulator-context';

interface WokwiSimulatorProviderProps {
  children: ReactNode;
}

export function WokwiSimulatorProvider({
  children,
}: WokwiSimulatorProviderProps) {
  const {
    state: { device, connectionType, connectionStatus },
  } = useJacDevice();

  return (
    <WokwiSimulatorContext.Provider
      value={{
        state: {
          hasDevice: Boolean(device),
          isWokwiConnection: connectionType === 'wokwi',
          isInitializing:
            connectionStatus === 'connecting' && connectionType === 'wokwi',
        },
      }}
    >
      {children}
    </WokwiSimulatorContext.Provider>
  );
}
