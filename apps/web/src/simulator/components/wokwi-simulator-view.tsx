import { useWokwiSimulator } from '@jaculus/wokwi';
import { AlertCircle, Unplug } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { StatusCard } from '@/ui/components/custom/status-card';
import { WokwiSimulatorEmbed } from './wokwi-simulator-embed';

export function WokwiSimulatorView() {
  const { state } = useWokwiSimulator();

  if (!state.hasDevice) {
    return (
      <StatusCard
        icon={<Unplug className="h-10 w-10" />}
        title={m.wokwi_no_device()}
        hint={m.wokwi_no_device_hint()}
      />
    );
  }

  if (!state.isWokwiConnection) {
    return (
      <StatusCard
        icon={<AlertCircle className="h-10 w-10" />}
        title={m.wokwi_wrong_connection()}
        hint={m.wokwi_wrong_connection_hint()}
      />
    );
  }

  return <WokwiSimulatorEmbed />;
}
