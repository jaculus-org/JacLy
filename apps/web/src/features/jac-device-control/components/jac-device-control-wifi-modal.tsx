import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog';
import { Input } from '@/features/shared/components/ui/input';
import { m } from '@/paraglide/messages';
import { useJacDeviceControl } from '../jac-device-control-context';

export function JacDeviceControlWifiModal() {
  const { state, actions } = useJacDeviceControl();

  return (
    <AlertDialog
      open={state.wifiModalOpen}
      onOpenChange={actions.handleCloseWifiModal}
    >
      <AlertDialogContent>
        {state.wifiModalMode === 'ap' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {m.config_configure_ap_title()}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {m.config_configure_ap_desc()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <Input
                placeholder={m.config_ap_ssid_placeholder()}
                value={state.apSsid}
                onChange={e => actions.setApSsid(e.target.value)}
              />
              <Input
                type="password"
                placeholder={m.config_ap_password_placeholder()}
                value={state.apPassword}
                onChange={e => actions.setApPassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{m.config_btn_cancel()}</AlertDialogCancel>
              <AlertDialogAction
                onClick={actions.handleConfigureAp}
                disabled={
                  state.loading['configureAp'] ||
                  !state.apSsid ||
                  !state.apPassword
                }
              >
                {state.loading['configureAp']
                  ? m.config_btn_saving()
                  : m.config_btn_save()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}

        {state.wifiModalMode === 'network' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {m.config_add_network_title()}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {m.config_add_network_desc()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <Input
                placeholder={m.config_network_ssid_placeholder()}
                value={state.newNetworkSsid}
                onChange={e => actions.setNewNetworkSsid(e.target.value)}
              />
              <Input
                type="password"
                placeholder={m.config_network_password_placeholder()}
                value={state.newNetworkPassword}
                onChange={e => actions.setNewNetworkPassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{m.config_btn_cancel()}</AlertDialogCancel>
              <AlertDialogAction
                onClick={actions.handleAddNetwork}
                disabled={
                  state.loading['addNetwork'] ||
                  !state.newNetworkSsid ||
                  !state.newNetworkPassword
                }
              >
                {state.loading['addNetwork']
                  ? m.config_btn_adding()
                  : m.config_btn_add_network()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}

        {state.wifiModalMode === 'remove' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {m.config_remove_network_title()}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {m.config_remove_network_desc()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder={m.config_network_ssid_placeholder()}
              value={state.removeNetworkSsid}
              onChange={e => actions.setRemoveNetworkSsid(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>{m.config_btn_cancel()}</AlertDialogCancel>
              <AlertDialogAction
                onClick={actions.handleRemoveNetwork}
                disabled={
                  state.loading['removeNetwork'] || !state.removeNetworkSsid
                }
              >
                {state.loading['removeNetwork']
                  ? m.config_btn_removing()
                  : m.config_btn_remove_network()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
