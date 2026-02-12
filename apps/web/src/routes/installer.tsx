import { Installer } from '@/features/jac-installer/components/installer';
import { m } from '@/paraglide/messages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/installer')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 min-h-screen bg-linear-to-b from-slate-900 to-slate-800 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">{m.installer_title()}</h1>
        <p className="text-slate-300">{m.installer_subtitle()}</p>
      </div>
      <div className="flex justify-center">
        <Installer />
      </div>
    </div>
  );
}
