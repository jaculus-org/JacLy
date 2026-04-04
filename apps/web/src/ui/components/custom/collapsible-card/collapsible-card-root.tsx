import type { ReactNode } from 'react';
import { Card } from '@/ui/components/card';
import { cn } from '@/ui/lib/cn';
import { CollapsibleCardProvider } from './collapsible-card-provider';

interface CollapsibleCardRootProps {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleCardRoot({
  children,
  defaultOpen,
  className,
}: CollapsibleCardRootProps) {
  return (
    <CollapsibleCardProvider defaultOpen={defaultOpen}>
      <Card className={cn('rounded-md pt-2', className)}>{children}</Card>
    </CollapsibleCardProvider>
  );
}
