import { Power, RotateCw } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { ButtonLoading } from '@/ui/components/custom/button-loading';
import { CollapsibleCard } from '@/ui/components/custom/collapsible-card';
import { useJacDeviceControl } from './device-control-context';

export function ControlSection() {
  const { state, actions } = useJacDeviceControl();

  return (
    <CollapsibleCard defaultOpen>
      <CollapsibleCard.Header
        name={m.config_control_title()}
        icon={<Power className="w-3.5 h-3.5" />}
      />

      <CollapsibleCard.Content className="p-2 space-y-1.5">
        <ButtonLoading
          size="sm"
          className="w-full justify-start h-8"
          loading={state.loading.start}
          icon={<Power className="w-3.5 h-3.5" />}
          onClick={actions.startProgram}
        >
          {m.config_start_program()}
        </ButtonLoading>

        <ButtonLoading
          size="sm"
          className="w-full justify-start h-8"
          variant="secondary"
          loading={state.loading.stop}
          icon={<Power className="w-3.5 h-3.5" />}
          onClick={actions.stopProgram}
        >
          {m.config_stop_program()}
        </ButtonLoading>

        <ButtonLoading
          size="sm"
          className="w-full justify-start h-8"
          variant="outline"
          loading={state.loading.restart}
          icon={<RotateCw className="w-3.5 h-3.5" />}
          onClick={actions.restartProgram}
        >
          {m.config_restart_program()}
        </ButtonLoading>
      </CollapsibleCard.Content>
    </CollapsibleCard>
  );
}
