import { createContext, useContext } from 'react';

export interface WokwiSimulatorState {
  hasDevice: boolean;
  isWokwiConnection: boolean;
  isInitializing: boolean;
}

export type WokwiSimulatorActions = Record<string, never>;

export interface WokwiSimulatorMeta {
  embedUrl: string;
}

export interface WokwiSimulatorContextValue {
  state: WokwiSimulatorState;
  actions: WokwiSimulatorActions;
  meta: WokwiSimulatorMeta;
}

export const WokwiSimulatorContext = createContext<
  WokwiSimulatorContextValue | undefined
>(undefined);

export function useWokwiSimulator(): WokwiSimulatorContextValue {
  const context = useContext(WokwiSimulatorContext);
  if (!context) {
    throw new Error(
      'WokwiSimulator.* components must be within WokwiSimulator.Provider'
    );
  }
  return context;
}
