import { useMemo, useState, type ReactNode } from 'react';
import {
  CollapsibleCardContext,
  type CollapsibleCardContextValue,
} from './collapsible-card-context';

interface CollapsibleCardProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleCardProvider({
  children,
  defaultOpen = true,
}: CollapsibleCardProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const value = useMemo<CollapsibleCardContextValue>(
    () => ({
      state: { isOpen },
      actions: {
        toggle: () => setIsOpen(prev => !prev),
        setOpen: setIsOpen,
      },
      meta: { defaultOpen },
    }),
    [isOpen, defaultOpen]
  );

  return (
    <CollapsibleCardContext.Provider value={value}>
      {children}
    </CollapsibleCardContext.Provider>
  );
}
