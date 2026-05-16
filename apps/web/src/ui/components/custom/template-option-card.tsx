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
          ? 'border-primary/60 bg-primary/8 shadow-[0_8px_28px_-16px_rgba(37,150,228,0.25)]'
          : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_-24px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_14px_34px_-26px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      {isSelected && (
        <span className="absolute right-3 top-3">
          <CheckCircle className="size-5 text-primary" />
        </span>
      )}

      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{title}</span>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm leading-snug text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
