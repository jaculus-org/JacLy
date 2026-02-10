import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import { Loader2, AlertCircle, Unplug } from 'lucide-react';
import { m } from '@/paraglide/messages';

export function WokwiSimulator() {
  const { device, connectionType, isWokwiInitializing } = useJacDevice();

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <Unplug className="h-16 w-16 text-slate-400 dark:text-gray-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{m.wokwi_no_device()}</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {m.wokwi_no_device_hint()}
          </p>
        </div>
      </div>
    );
  }

  if (connectionType !== 'wokwi') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <AlertCircle className="h-16 w-16 text-amber-500 dark:text-amber-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {m.wokwi_wrong_connection()}
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {m.wokwi_wrong_connection_hint()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      <iframe
        src="https://wokwi.com/experimental/embed"
        width="100%"
        height="100%"
        id="wokwi-embed"
        className={`rounded-lg transition-all duration-300 ${isWokwiInitializing ? 'blur-[1px]' : ''}`}
      ></iframe>
      {isWokwiInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-lg">
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-slate-100/90 dark:bg-gray-900/90 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-gray-100" />
            <p className="text-sm font-medium">{m.wokwi_initializing()}</p>
            <p className="text-xs text-slate-700 dark:text-gray-300">
              {m.wokwi_initializing_hint()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
