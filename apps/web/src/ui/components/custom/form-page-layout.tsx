import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

interface FormPageLayoutProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormPageLayout({ title, children, className }: FormPageLayoutProps) {
  return (
    <div className={cn('space-y-6 py-8', className)}>
      <h1 className="mx-auto max-w-3xl text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="mx-auto max-w-3xl space-y-3">{children}</div>
    </div>
  );
}
