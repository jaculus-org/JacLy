import { CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

interface TemplateOptionCardProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function TemplateOptionCard({
  title,
  description,
  badge,
  isSelected,
  onSelect,
  className,
}: TemplateOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-xl border p-4 text-left transition-all duration-200',
        isSelected
          ? 'border-sky-400/90 bg-sky-50/80 shadow-[0_8px_28px_-16px_rgba(14,165,233,0.25)] dark:border-sky-600/70 dark:bg-sky-950/40 dark:shadow-[0_10px_30px_-18px_rgba(14,165,233,0.35)]'
          : 'border-sky-200/60 bg-white/60 hover:-translate-y-0.5 hover:border-sky-300/80 hover:shadow-[0_12px_32px_-24px_rgba(15,23,42,0.2)] dark:border-sky-900/40 dark:bg-slate-950/50 dark:hover:border-sky-800/60 dark:hover:shadow-[0_14px_34px_-26px_rgba(2,6,23,0.7)]',
        className,
      )}
    >
      {isSelected && (
        <span className="absolute right-3 top-3">
          <CheckCircle className="size-5 text-sky-600 dark:text-sky-400" />
        </span>
      )}

      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-950 dark:text-slate-50">{title}</span>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
