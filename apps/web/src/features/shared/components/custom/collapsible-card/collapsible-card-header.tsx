import type { ReactNode } from 'react';
import { Button } from '@/features/shared/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCollapsibleCard } from './collapsible-card-context';

interface CollapsibleCardHeaderProps {
  name: ReactNode;
  icon?: ReactNode;
  action?: () => void;
  actionIcon?: ReactNode;
  actionDisabled?: boolean;
  className?: string;
}

export function CollapsibleCardHeader({
  name,
  icon,
  action,
  actionIcon,
  actionDisabled = false,
  className,
}: CollapsibleCardHeaderProps) {
  const { state, actions } = useCollapsibleCard();

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2.5 py-1 pb-0',
        className
      )}
    >
      <Button
        variant="ghost"
        className="h-auto p-0 text-sm text-current hover:bg-transparent"
        onClick={actions.toggle}
      >
        <span className="flex items-center gap-2 font-medium">
          {icon}
          {name}
        </span>
      </Button>

      <div className="flex items-center gap-1">
        {action && actionIcon && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-current hover:bg-slate-800 dark:hover:bg-slate-700"
            onClick={event => {
              event.stopPropagation();
              action();
            }}
            disabled={actionDisabled}
          >
            {actionIcon}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-current hover:bg-slate-800 dark:hover:bg-slate-700"
          onClick={actions.toggle}
        >
          {state.isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
