interface PanelWrapperProps {
  children: React.ReactNode;
  name?: string;
  highlight?: boolean;
}

export function PanelWrapper({
  children,
  name,
  highlight = false,
}: PanelWrapperProps) {
  return (
    <div
      className={`h-full w-full flex flex-col rounded border bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ${
        highlight
          ? 'border-red-500 border-2'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {name && (
        <div
          className={`p-2 border-b bg-white dark:bg-slate-800 ${
            highlight
              ? 'border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              highlight
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {name}
          </h2>
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
