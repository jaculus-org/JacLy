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
          'border-border bg-card shadow-[0_20px_48px_-36px_rgba(15,23,42,0.12)] dark:shadow-[0_22px_50px_-38px_rgba(0,0,0,0.5)]',
        variant === 'subdued' &&
          'border-dashed border-border bg-muted/40',
        className,
      )}
    >
      <CardHeader className="gap-1.5 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
