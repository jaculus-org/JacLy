import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card';
import { cn } from '@/ui/lib/cn';

interface ProjectFormSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subdued';
}

export function ProjectFormSection({
  title,
  description,
  children,
  className,
  variant = 'default',
}: ProjectFormSectionProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border rounded-2xl transition-all',
        variant === 'default' &&
          'border-sky-200/80 bg-white/74 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.24)] dark:border-sky-950/55 dark:bg-[linear-gradient(180deg,rgba(17,29,58,0.88),rgba(14,23,46,0.82))] dark:shadow-[0_22px_50px_-38px_rgba(2,6,23,0.8)]',
        variant === 'subdued' &&
          'border-dashed border-sky-200/60 bg-sky-50/40 dark:border-sky-950/40 dark:bg-sky-950/18',
        className,
      )}
    >
      <CardHeader className="gap-1.5 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
