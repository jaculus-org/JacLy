import { createContext, useContext, useRef, ReactNode } from 'react';
import * as FlexLayout from 'flexlayout-react';

interface FlexLayoutContextType {
  modelRef: React.MutableRefObject<FlexLayout.Model | null>;
  showJaculusPanel: () => void;
  hideJaculusPanel: () => void;
  toggleJaculusPanel: () => void;
  showTerminal: () => void;
  showGeneratedCode: () => void;
}

const FlexLayoutContext = createContext<FlexLayoutContextType | undefined>(
  undefined
);

interface FlexLayoutProviderProps {
  children: ReactNode;
}

export function FlexLayoutProvider({ children }: FlexLayoutProviderProps) {
  const modelRef = useRef<FlexLayout.Model | null>(null);

  const showJaculusPanel = () => {
    if (modelRef.current) {
      // First select the tab to make it active
      modelRef.current.doAction(FlexLayout.Actions.selectTab('jaculus'));

      // Then ensure the border is visible by updating the model
      const jaculusNode = modelRef.current.getNodeById('jaculus');
      if (jaculusNode) {
        const borderNode = jaculusNode.getParent();
        if (borderNode && borderNode.getType() === 'border') {
          modelRef.current.doAction(
            FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
              size: 350,
            })
          );
        }
      }
    }
  };

  const hideJaculusPanel = () => {
    if (modelRef.current) {
      const jaculusNode = modelRef.current.getNodeById('jaculus');
      if (jaculusNode) {
        const borderNode = jaculusNode.getParent();
        if (borderNode && borderNode.getType() === 'border') {
          modelRef.current.doAction(
            FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
              size: 0,
            })
          );
        }
      }
    }
  };

  const toggleJaculusPanel = () => {
    if (modelRef.current) {
      const jaculusNode = modelRef.current.getNodeById('jaculus');
      if (jaculusNode) {
        const borderNode = jaculusNode.getParent();
        if (borderNode && borderNode.getType() === 'border') {
          const currentSize = borderNode.getRect().width;
          if (currentSize > 0) {
            hideJaculusPanel();
          } else {
            showJaculusPanel();
          }
        }
      }
    }
  };

  const showTerminal = () => {
    if (modelRef.current) {
      // First select the terminal tab
      modelRef.current.doAction(FlexLayout.Actions.selectTab('terminal'));

      // Then ensure the border is visible
      const terminalNode = modelRef.current.getNodeById('terminal');
      if (terminalNode) {
        const borderNode = terminalNode.getParent();
        if (borderNode && borderNode.getType() === 'border') {
          modelRef.current.doAction(
            FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
              size: 400,
            })
          );
        }
      }
    }
  };

  const showGeneratedCode = () => {
    if (modelRef.current) {
      // First select the code tab
      modelRef.current.doAction(FlexLayout.Actions.selectTab('code'));

      // Then ensure the border is visible
      const codeNode = modelRef.current.getNodeById('code');
      if (codeNode) {
        const borderNode = codeNode.getParent();
        if (borderNode && borderNode.getType() === 'border') {
          modelRef.current.doAction(
            FlexLayout.Actions.updateNodeAttributes(borderNode.getId(), {
              size: 400,
            })
          );
        }
      }
    }
  };

  const value: FlexLayoutContextType = {
    modelRef,
    showJaculusPanel,
    hideJaculusPanel,
    toggleJaculusPanel,
    showTerminal,
    showGeneratedCode,
  };

  return (
    <FlexLayoutContext.Provider value={value}>
      {children}
    </FlexLayoutContext.Provider>
  );
}

export function useFlexLayout() {
  const context = useContext(FlexLayoutContext);
  if (context === undefined) {
    throw new Error('useFlexLayout must be used within a FlexLayoutProvider');
  }
  return context;
}
