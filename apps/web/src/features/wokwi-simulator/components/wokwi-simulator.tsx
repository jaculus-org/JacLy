import { WokwiSimulatorProvider } from '../wokwi-simulator-provider';
import { WokwiSimulatorView } from './wokwi-simulator-view';

export function WokwiSimulator() {
  return (
    <WokwiSimulatorProvider>
      <WokwiSimulatorView />
    </WokwiSimulatorProvider>
  );
}
