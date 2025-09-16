import { Unplug } from 'lucide-react';
import { SelectConnection } from '../connect/select-connection';

export function JaculusDisconnected() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        <Unplug className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No device connected</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Jaculus device to get started
          </p>
        </div>
        <SelectConnection oneLine={false} className="justify-center" />
      </div>
    </div>
  );
}
