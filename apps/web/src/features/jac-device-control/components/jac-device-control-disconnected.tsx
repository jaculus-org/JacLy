import { m } from '@/paraglide/messages';
import { Card } from '@/features/shared/components/ui/card';
import { Unplug } from 'lucide-react';

export function JacDeviceControlDisconnected() {
  return (
    <div className="h-full p-2">
      <Card className="h-full flex flex-col items-center justify-center gap-3">
        <Unplug className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{m.config_no_device()}</h3>
          <p className="text-sm text-muted-foreground">
            {m.config_no_device_hint()}
          </p>
        </div>
      </Card>
    </div>
  );
}
