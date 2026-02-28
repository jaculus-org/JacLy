import { type ReactNode } from 'react';
import { FieldSet } from '@/features/shared/components/ui/field';

export function InstallerLayout({ children }: { children: ReactNode }) {
  return (
    <FieldSet className="flex flex-col gap-4 w-full max-w-4xl">
      {children}
    </FieldSet>
  );
}
