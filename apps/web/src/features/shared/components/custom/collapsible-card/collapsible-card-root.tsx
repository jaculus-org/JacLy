import type { ReactNode } from 'react';
import { Card } from '@/features/shared/components/ui/card';
import { cn } from '@/lib/utils/cn';
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
