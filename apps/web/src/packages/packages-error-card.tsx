'use client';

import { RefreshCw } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { Card } from '@/ui/components/card';
import { useJacPackages } from './packages-context';

export function JacPackagesErrorCard() {
  const {
    state: { error, loadError, loadStatus },
    actions: { retryLoad },
  } = useJacPackages();

  if (loadStatus === 'error' && loadError) {
    return (
      <Card className="border-destructive bg-destructive/10 p-3">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={retryLoad}>
          <RefreshCw className="mr-1 h-3 w-3" />
          {m.project_panel_pkg_retry()}
        </Button>
      </Card>
    );
  }

  if (!error) return null;

  return (
    <Card className="border-destructive bg-destructive/10 p-3">
      <p className="text-sm text-destructive">{error}</p>
    </Card>
  );
}
