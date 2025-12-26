export function LoadingEditor() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Modern spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />

          {/* Animated arc */}
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"
            style={{ animationDuration: '0.8s' }}
          />

          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-medium text-slate-900 dark:text-white">
            Loading Editor
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}
