export function LoadingEditor() {
  return (
    <div className="h-full w-full bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      {/* Main container */}
      <div className="flex flex-col items-center gap-8">
        {/* Animated logo/icon */}
        <div className="relative w-20 h-20">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />

          {/* Middle rotating ring (reversed) */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-400 animate-spin-reverse" />

          {/* Inner pulsing circle */}
          <div className="absolute inset-4 rounded-full bg-linear-to-br from-blue-500 to-purple-500 animate-pulse" />
        </div>

        {/* Loading text with animation */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            Initializing Editor
          </h2>
          <p className="text-slate-300 text-sm">
            <span className="inline-block">Loading filesystem</span>
            <span className="inline-block ml-1">
              <span className="inline-block w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
              <span
                className="inline-block w-1 h-1 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="inline-block w-1 h-1 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ animationDelay: '4s' }}
        />
      </div>
    </div>
  );
}
