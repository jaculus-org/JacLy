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
        'relative overflow-hidden rounded-[2rem] border border-sky-200/75 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_78%_22%,_rgba(45,212,191,0.12),_transparent_26%),linear-gradient(180deg,_rgba(244,249,255,0.98),_rgba(232,241,252,0.96))] px-6 py-8 shadow-[0_28px_80px_-52px_rgba(14,30,63,0.28)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_78%_22%,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.95),_rgba(15,23,42,0.92))] sm:px-8 sm:py-10',
        className,
      )}
    >
      {hasSideContent ? (
        <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-sky-100/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.22),_rgba(191,219,254,0.05))] lg:block dark:border-slate-800/70 dark:bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))]" />
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
                'text-balance text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl',
                titleClassName,
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  'max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg',
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
