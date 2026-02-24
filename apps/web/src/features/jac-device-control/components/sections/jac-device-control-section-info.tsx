import { m } from '@/paraglide/messages';
import { Badge } from '@/features/shared/components/ui/badge';
import { Card } from '@/features/shared/components/ui/card';
import { Separator } from '@/features/shared/components/ui/separator';
import { CollapsibleCard } from '@/features/shared/components/custom/collapsible-card';
import { Info, Power, RefreshCw, RotateCw } from 'lucide-react';
import { useJacDeviceControl } from '../../jac-device-control-context';

export function JacDeviceControlSectionInfo() {
  const { state, actions } = useJacDeviceControl();

  return (
    <CollapsibleCard defaultOpen>
      <CollapsibleCard.Header
        name={m.config_device_info_title()}
        icon={<Info className="w-3.5 h-3.5" />}
        action={actions.handleGetDeviceInfo}
        actionIcon={
          <RefreshCw
            className={`w-4 h-4 ${state.loading['getDeviceInfo'] ? 'animate-spin' : ''}`}
          />
        }
        actionDisabled={state.loading['getDeviceInfo']}
      />

      <CollapsibleCard.Content className="p-2 space-y-1.5">
        <Card className="space-y-2 p-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Power className="w-3 h-3" />
              <span className="text-xs font-medium">
                {m.config_running_label()}
              </span>
            </div>
            <div className="pl-5">
              <Badge variant="secondary" className="font-mono text-xs">
                {state.loading['getDeviceInfo'] && !state.deviceStatus
                  ? m.config_fetching()
                  : state.deviceStatus?.running
                    ? m.config_running_yes()
                    : m.config_running_no()}
              </Badge>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span className="text-xs font-medium">
                {m.config_status_label()}
              </span>
            </div>
            <code className="text-xs break-all block pl-5 text-muted-foreground">
              {state.loading['getDeviceInfo'] && !state.deviceStatus
                ? m.config_fetching()
                : state.deviceStatus?.status || m.config_status_unknown()}
            </code>
          </div>

          {state.deviceStatus?.exitCode !== undefined && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <RotateCw className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {m.config_exit_code_label()}
                </span>
              </div>
              <Badge variant="outline" className="ml-5 font-mono text-xs">
                {state.deviceStatus.exitCode}
              </Badge>
            </div>
          )}

          <Separator />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span className="text-xs font-medium">
                {m.config_version_label()}
              </span>
            </div>
            <code className="text-xs break-all block pl-5 text-muted-foreground">
              {state.loading['getDeviceInfo'] && !state.deviceVersion.length
                ? m.config_fetching()
                : state.deviceVersion.join(' • ') || m.config_status_unknown()}
            </code>
          </div>
        </Card>
      </CollapsibleCard.Content>
    </CollapsibleCard>
  );
}
