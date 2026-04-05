import { WokwiSimulatorProvider } from '../state/simulator-provider';
import { WokwiSimulatorView } from './wokwi-simulator-view';

export function WokwiSimulator() {
  return (
    <WokwiSimulatorProvider>
      <WokwiSimulatorView />
    </WokwiSimulatorProvider>
  );
}
