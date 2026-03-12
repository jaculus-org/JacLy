import { Installer } from '@/features/jac-installer';
import { Logger } from '@/features/logger';
import { m } from '@/paraglide/messages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/installer')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 min-h-screen bg-linear-to-b from-background to-muted/30 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          {m.installer_title()}
        </h1>
        <p className="text-muted-foreground">{m.installer_subtitle()}</p>
      </div>
      <div className="flex justify-center">
        <Installer.Provider>
          <Installer.Layout>
            <Installer.Controls />
            <Installer.Progress />
            <Logger.Logs
              logOrderType="exact"
              defaultLevel="installer"
              logLevelSelector={false}
              hideIfEmpty
            />
            <Installer.Dialog />
          </Installer.Layout>
        </Installer.Provider>
      </div>
    </div>
  );
}
