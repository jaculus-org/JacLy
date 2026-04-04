import { createContext, useContext } from 'react';

export interface CollapsibleCardState {
  isOpen: boolean;
}

export interface CollapsibleCardActions {
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export interface CollapsibleCardMeta {
  defaultOpen: boolean;
}

export interface CollapsibleCardContextValue {
  state: CollapsibleCardState;
  actions: CollapsibleCardActions;
  meta: CollapsibleCardMeta;
}

export const CollapsibleCardContext = createContext<
  CollapsibleCardContextValue | undefined
>(undefined);

export function useCollapsibleCard(): CollapsibleCardContextValue {
  const context = useContext(CollapsibleCardContext);
  if (!context) {
    throw new Error(
      'CollapsibleCard.* must be used within CollapsibleCard.Provider'
    );
  }
  return context;
}
