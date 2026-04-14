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
      className={`h-full w-full flex flex-col rounded border bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ${
        highlight ? 'border-red-500 border-2' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {name && (
        <div
          className={`flex items-center gap-2 p-2 border-b bg-white dark:bg-slate-800 ${
            highlight ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              highlight ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {name}
          </h2>
          {onPopout && (
            <button
              type="button"
              onClick={onPopout}
              className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded text-gray-700 transition-colors hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-slate-700"
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
