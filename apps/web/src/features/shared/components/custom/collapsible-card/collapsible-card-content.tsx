import type { ReactNode } from 'react';
import { Separator } from '@/features/shared/components/ui/separator';
import { cn } from '@/lib/utils/cn';
import { useCollapsibleCard } from './collapsible-card-context';

interface CollapsibleCardContentProps {
  children: ReactNode;
  className?: string;
  withSeparator?: boolean;
}

export function CollapsibleCardContent({
  children,
  className,
  withSeparator = true,
}: CollapsibleCardContentProps) {
  const { state } = useCollapsibleCard();

  if (!state.isOpen) {
    return null;
  }

  return (
    <>
      {withSeparator && <Separator />}
      <div className={cn('p-2.5 ', className)}>{children}</div>
    </>
  );
}
