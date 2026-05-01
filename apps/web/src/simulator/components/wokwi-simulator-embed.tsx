import { useWokwiSimulator, WokwiEmbed } from '@jaculus/wokwi';
import { WokwiSimulatorLoading } from './wokwi-simulator-loading';

export function WokwiSimulatorEmbed() {
  const { state } = useWokwiSimulator();

  return (
    <div className="relative h-full">
      <WokwiEmbed
        id="wokwi-embed"
        isInitializing={state.isInitializing}
        className={state.isInitializing ? 'blur-[1px]' : undefined}
      />
      {state.isInitializing && <WokwiSimulatorLoading />}
    </div>
  );
}
