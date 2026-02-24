import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { CollapsibleCard } from '@/features/shared/components/custom/collapsible-card';
import { m } from '@/paraglide/messages';
import { Power, RotateCw } from 'lucide-react';
import { useJacDeviceControl } from '../../jac-device-control-context';

export function JacDeviceControlSectionControl() {
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
          loading={state.loading['start']}
          icon={<Power className="w-3.5 h-3.5" />}
          onClick={actions.startProgram}
        >
          {m.config_start_program()}
        </ButtonLoading>

        <ButtonLoading
          size="sm"
          className="w-full justify-start h-8"
          variant="secondary"
          loading={state.loading['stop']}
          icon={<Power className="w-3.5 h-3.5" />}
          onClick={actions.stopProgram}
        >
          {m.config_stop_program()}
        </ButtonLoading>

        <ButtonLoading
          size="sm"
          className="w-full justify-start h-8"
          variant="outline"
          loading={state.loading['restart']}
          icon={<RotateCw className="w-3.5 h-3.5" />}
          onClick={actions.restartProgram}
        >
          {m.config_restart_program()}
        </ButtonLoading>
      </CollapsibleCard.Content>
    </CollapsibleCard>
  );
}
