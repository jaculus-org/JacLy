interface PanelWrapperProps {
  children: React.ReactNode;
  name?: string;
}

export function PanelWrapper({ children, name }: PanelWrapperProps) {
  return (
    <div className="h-full w-full flex flex-col rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm">
      {name && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {name}
          </h2>
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
