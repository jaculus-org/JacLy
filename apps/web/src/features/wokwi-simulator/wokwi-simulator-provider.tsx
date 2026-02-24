import type { ReactNode } from 'react';
import { useJacDevice } from '@/features/jac-device';
import { WokwiSimulatorContext } from './wokwi-simulator-context';

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
        actions: {},
        meta: {
          embedUrl: 'https://wokwi.com/experimental/embed',
        },
      }}
    >
      {children}
    </WokwiSimulatorContext.Provider>
  );
}
