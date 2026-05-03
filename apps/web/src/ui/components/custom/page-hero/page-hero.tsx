import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

interface PageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  topSlot?: ReactNode;
  actions?: ReactNode;
  sideContent?: ReactNode;
  className?: string;
  contentClassName?: string;
  sideClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

export function PageHero({
  title,
  description,
  topSlot,
  actions,
  sideContent,
  className,
  contentClassName,
  sideClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: PageHeroProps) {
  const hasSideContent = sideContent != null;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-8 shadow-[0_28px_80px_-52px_rgba(14,30,63,0.28)] dark:shadow-[0_28px_80px_-52px_rgba(0,0,0,0.5)] sm:px-8 sm:py-10',
        className,
      )}
    >
      {hasSideContent ? (
        <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-border/50 bg-card/30 lg:block" />
      ) : null}

      <div
        className={cn(
          hasSideContent
            ? 'relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end'
            : 'relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between',
        )}
      >
        <div className={cn('space-y-6', contentClassName)}>
          {topSlot}

          <div className="max-w-3xl space-y-4">
            <h1
              className={cn(
                'text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl',
                titleClassName,
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  'max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg',
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className={cn('flex flex-wrap gap-3', actionsClassName)}>{actions}</div>
          ) : null}
        </div>

        {hasSideContent ? (
          <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-1', sideClassName)}>
            {sideContent}
          </div>
        ) : null}
      </div>
    </section>
  );
}
