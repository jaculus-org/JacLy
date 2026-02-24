import { Card } from '@/features/shared/components/ui/card';
import { m } from '@/paraglide/messages';
import { Loader2 } from 'lucide-react';

export function WokwiSimulatorLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
      <Card className="flex flex-col items-center gap-2 p-4 m-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium">{m.wokwi_initializing()}</p>
        <p className="text-xs text-muted-foreground">
          {m.wokwi_initializing_hint()}
        </p>
      </Card>
    </div>
  );
}
