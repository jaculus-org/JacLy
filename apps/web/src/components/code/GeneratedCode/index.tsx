import { CodeEditor } from '@/components/code/CodeEditor';
import { useJac } from '@/jaculus/provider/jac-context';
import { useIntlayer } from 'react-intlayer';

export function GeneratedCode() {
  const { generatedCode } = useJac();
  const content = useIntlayer('generated-code');

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {content.generatedCodeTab}
        </h2>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor value={generatedCode} language="js" />
      </div>
    </div>
  );
}
