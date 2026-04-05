'use client';

import { Card } from '@/ui/components/card';
import { useJacPackages } from '../state/packages-context';

export function JacPackagesErrorCard() {
  const {
    state: { error },
  } = useJacPackages();

  if (!error) return null;

  return (
    <Card className="border-destructive bg-destructive/10 p-3">
      <p className="text-sm text-destructive">{error}</p>
    </Card>
  );
}
