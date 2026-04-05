import { Button } from '@/ui/components/button';
import { Card } from '@/ui/components/card';
import { CollapsibleCard } from '@/ui/components/custom/collapsible-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/select';
import { m } from '@/core/paraglide/messages';
import { Globe, Loader2, Lock, RefreshCw, Trash2, Wifi } from 'lucide-react';
import { useJacDeviceControl } from '../../state/device-control-context';
import { WifiModal } from './wifi-modal';

export function WifiSection() {
  const { state, actions } = useJacDeviceControl();

  return (
    <CollapsibleCard defaultOpen>
      <CollapsibleCard.Header
        name={m.config_wifi_title()}
        icon={<Wifi className="w-3.5 h-3.5" />}
        action={actions.refreshWifi}
        actionIcon={
          <RefreshCw
            className={`w-4 h-4 ${state.loading['getWifiInfo'] ? 'animate-spin' : ''}`}
          />
        }
        actionDisabled={state.loading['getWifiInfo']}
      />

      <CollapsibleCard.Content className="p-2 space-y-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">
            {m.config_wifi_mode_label()}
          </label>
          <Select value={state.wifiMode} onValueChange={actions.setWifiMode}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder={m.config_wifi_mode_placeholder()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{m.config_wifi_mode_disabled()}</SelectItem>
              <SelectItem value="1">{m.config_wifi_mode_sta()}</SelectItem>
              <SelectItem value="2">{m.config_wifi_mode_ap()}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-2 text-xs">
          <div className="flex items-center gap-2">
            {state.loading['getWifiInfo'] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            <span className="font-medium">{m.config_current_ip_label()}</span>
          </div>
          <code className="break-all text-muted-foreground">
            {state.loading['getWifiInfo'] && !state.wifiIp
              ? m.config_fetching()
              : state.wifiIp || m.config_no_ip()}
          </code>
        </Card>

        <div className="space-y-1.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-8"
            onClick={() => actions.openWifiModal('ap')}
          >
            <Lock className="w-4 h-4" />
            {state.wifiApSsid
              ? m.config_configure_ap_current({ ssid: state.wifiApSsid })
              : m.config_configure_ap_title()}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-8"
            onClick={() => actions.openWifiModal('network')}
          >
            <Wifi className="w-4 h-4" />
            {m.config_add_network_title()}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-8"
            onClick={() => actions.openWifiModal('remove')}
          >
            <Trash2 className="w-4 h-4" />
            {m.config_remove_network_title()}
          </Button>
        </div>

        <WifiModal />
      </CollapsibleCard.Content>
    </CollapsibleCard>
  );
}
