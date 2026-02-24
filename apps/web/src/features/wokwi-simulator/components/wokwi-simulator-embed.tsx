import { useWokwiSimulator } from '../wokwi-simulator-context';
import { WokwiSimulatorLoading } from './wokwi-simulator-loading';

export function WokwiSimulatorEmbed() {
  const { state, meta } = useWokwiSimulator();

  return (
    <div className="relative h-full">
      <iframe
        id="wokwi-embed"
        src={meta.embedUrl}
        width="100%"
        height="100%"
        className={state.isInitializing ? 'blur-[1px]' : undefined}
      />
      {state.isInitializing && <WokwiSimulatorLoading />}
    </div>
  );
}
