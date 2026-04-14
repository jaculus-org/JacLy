import { Logger } from '@/core';
import { InstallerProvider } from '../state/installer-provider';
import { InstallerControls } from './installer-controls';
import { InstallerDialog } from './installer-dialog';
import { InstallerLayout } from './installer-layout';
import { InstallerProgress } from './installer-progress';

export function InstallerPanel() {
  return (
    <div className="flex flex-col gap-2 min-h-screen from-slate-900 to-slate-800 p-3">
      <div className="flex justify-center">
        <InstallerProvider>
          <InstallerLayout>
            <InstallerControls />
            <InstallerProgress />
            <Logger.Logs
              logOrderType="exact"
              defaultLevel="installer"
              logLevelSelector={false}
              hideIfEmpty
            />
            <InstallerDialog />
          </InstallerLayout>
        </InstallerProvider>
      </div>
    </div>
  );
}
