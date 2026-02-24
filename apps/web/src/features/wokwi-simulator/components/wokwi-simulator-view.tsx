import { StatusCard } from '@/features/shared/components/custom/status-card';
import { useWokwiSimulator } from '../wokwi-simulator-context';
import { WokwiSimulatorEmbed } from './wokwi-simulator-embed';
import { AlertCircle, Unplug } from 'lucide-react';
import { m } from '@/paraglide/messages';

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
