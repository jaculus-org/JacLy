import { FileExplorer } from '@/components/file/file-explorer';
import { useFlexLayout } from '@/providers/flexlayout-provider';

export function FileExplorerPanel() {
  const { addCodeTab } = useFlexLayout();

  function handleFileSelect(filePath: string) {
    addCodeTab(filePath);
  }

  return <FileExplorer onFileSelect={handleFileSelect} />;
}
