import { CodeEditor } from '@/components/code/code-editor';
import { useJacly } from '@/components/jacly-provider';

export function GeneratedCode() {
  const { generatedCode } = useJacly();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Generated Code
        </h2>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor value={generatedCode} language="js" />
      </div>
    </div>
  );
}
