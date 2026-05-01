import { WokwiSimulatorProvider as WokwiSimulatorProviderBase } from '@jaculus/wokwi';
import type { ReactNode } from 'react';
import { useJacDevice } from '@/device';

interface WokwiSimulatorProviderProps {
  children: ReactNode;
}

export function WokwiSimulatorProvider({ children }: WokwiSimulatorProviderProps) {
  const {
    state: { device, connectionType, connectionStatus },
  } = useJacDevice();

  return (
    <WokwiSimulatorProviderBase
      hasDevice={Boolean(device)}
      isWokwiConnection={connectionType === 'wokwi'}
      isInitializing={connectionStatus === 'connecting' && connectionType === 'wokwi'}
    >
      {children}
    </WokwiSimulatorProviderBase>
  );
}
