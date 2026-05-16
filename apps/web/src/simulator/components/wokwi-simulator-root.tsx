import { WokwiSimulatorProvider } from '../state/simulator-provider';
import { WokwiSimulatorView } from './wokwi-simulator-view';

export function WokwiSimulatorRoot() {
  return (
    <WokwiSimulatorProvider>
      <WokwiSimulatorView />
    </WokwiSimulatorProvider>
  );
}
