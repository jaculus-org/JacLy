import { createContext, useContext } from 'react';

export interface WokwiSimulatorState {
  hasDevice: boolean;
  isWokwiConnection: boolean;
  isInitializing: boolean;
}

export interface WokwiSimulatorContextValue {
  state: WokwiSimulatorState;
}

export const WokwiSimulatorContext = createContext<WokwiSimulatorContextValue | undefined>(
  undefined,
);

export function useWokwiSimulator(): WokwiSimulatorContextValue {
  const context = useContext(WokwiSimulatorContext);
  if (!context) {
    throw new Error('WokwiSimulator.* components must be within WokwiSimulator.Provider');
  }
  return context;
}
