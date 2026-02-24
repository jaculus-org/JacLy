import { Installer } from '@/features/jac-installer';

export function InstallerPanel() {
  return (
    <div className="flex flex-col gap-2 min-h-screen from-slate-900 to-slate-800 p-3">
      <div className="flex justify-center">
        <Installer />
      </div>
    </div>
  );
}
