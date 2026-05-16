import { Info, Power, RefreshCw, RotateCw } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Badge } from '@/ui/components/badge';
import { Card } from '@/ui/components/card';
import { CollapsibleCard } from '@/ui/components/custom/collapsible-card';
import { Separator } from '@/ui/components/separator';
import { useJacDeviceControl } from './device-control-context';

export function InfoSection() {
  const { state, actions } = useJacDeviceControl();

  return (
    <CollapsibleCard defaultOpen>
      <CollapsibleCard.Header
        name={m.config_device_info_title()}
        icon={<Info className="w-3.5 h-3.5" />}
        action={actions.refreshDevice}
        actionIcon={
          <RefreshCw className={`w-4 h-4 ${state.loading.getDeviceInfo ? 'animate-spin' : ''}`} />
        }
        actionDisabled={state.loading.getDeviceInfo}
      />

      <CollapsibleCard.Content className="p-2 space-y-1.5">
        <Card className="space-y-2 p-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Power className="w-3 h-3" />
              <span className="text-xs font-medium">{m.config_running_label()}</span>
            </div>
            <div className="pl-5">
              <Badge variant="secondary" className="font-mono text-xs">
                {state.loading.getDeviceInfo && !state.deviceStatus
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
              <span className="text-xs font-medium">{m.config_status_label()}</span>
            </div>
            <code className="text-xs break-all block pl-5 text-muted-foreground">
              {state.loading.getDeviceInfo && !state.deviceStatus
                ? m.config_fetching()
                : state.deviceStatus?.status || m.config_status_unknown()}
            </code>
          </div>

          {state.deviceStatus?.exitCode !== undefined && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <RotateCw className="w-3 h-3" />
                <span className="text-xs font-medium">{m.config_exit_code_label()}</span>
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
              <span className="text-xs font-medium">{m.config_version_label()}</span>
            </div>
            <code className="text-xs break-all block pl-5 text-muted-foreground">
              {state.loading.getDeviceInfo && !state.deviceVersion
                ? m.config_fetching()
                : state.deviceVersion
                  ? `dcore@${state.deviceVersion.dcore} • esp32@${state.deviceVersion.esp32}`
                  : m.config_status_unknown()}
            </code>
          </div>
        </Card>
      </CollapsibleCard.Content>
    </CollapsibleCard>
  );
}
