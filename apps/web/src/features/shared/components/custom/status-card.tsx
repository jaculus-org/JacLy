import type { ReactNode } from 'react';
import { Card } from '@/features/shared/components/ui/card';

interface StatusCardProps {
  icon: ReactNode;
  title: ReactNode;
  hint: ReactNode;
}

export function StatusCard({ icon, title, hint }: StatusCardProps) {
  return (
    <div className="h-full p-2">
      <Card className="h-full flex flex-col items-center justify-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </Card>
    </div>
  );
}
