import * as FlexLayout from 'flexlayout-react';

interface PanelWrapperProps {
  children: React.ReactNode;
  name?: string;
  highlight?: boolean;
  onPopout?: () => void;
}

export function PanelWrapper({ children, name, highlight = false, onPopout }: PanelWrapperProps) {
  return (
    <div
      className={`h-full w-full flex flex-col rounded border bg-secondary shadow-sm transition-all duration-300 ${
        highlight ? 'border-red-500 border-2' : 'border-border'
      }`}
    >
      {name && (
        <div
          className={`flex items-center gap-2 p-2 border-b bg-secondary ${
            highlight ? 'border-red-500' : 'border-border'
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              highlight ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'
            }`}
          >
            {name}
          </h2>
          {onPopout && (
            <button
              type="button"
              onClick={onPopout}
              className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent"
              title="Pop out panel"
              aria-label="Pop out panel"
            >
              <FlexLayout.PopoutIcon />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
