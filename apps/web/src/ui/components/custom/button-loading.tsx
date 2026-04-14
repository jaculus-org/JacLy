import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/ui/components/button';

type ButtonVariants = VariantProps<typeof Button>;

interface ButtonLoadingProps extends React.ComponentProps<typeof Button>, ButtonVariants {
  loading?: boolean;
  spinnerPosition?: 'start' | 'end';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function ButtonLoading({
  loading = false,
  spinnerPosition = 'start',
  children,
  disabled,
  className,
  icon,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button disabled={disabled || loading} className={className} {...props}>
      {loading && spinnerPosition === 'start' ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        icon
      )}
      {children}
      {loading && spinnerPosition === 'end' && (
        <Loader2 className="animate-spin" data-icon="inline-end" />
      )}
    </Button>
  );
}
