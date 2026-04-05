import { WOKWI_EMBED_URL } from '../constants';
import { useWokwiSimulator } from '../state/simulator-context';
import { WokwiSimulatorLoading } from './wokwi-simulator-loading';

export function WokwiSimulatorEmbed() {
  const { state } = useWokwiSimulator();

  return (
    <div className="relative h-full">
      <iframe
        id="wokwi-embed"
        src={WOKWI_EMBED_URL}
        width="100%"
        height="100%"
        className={state.isInitializing ? 'blur-[1px]' : undefined}
      />
      {state.isInitializing && <WokwiSimulatorLoading />}
    </div>
  );
}
