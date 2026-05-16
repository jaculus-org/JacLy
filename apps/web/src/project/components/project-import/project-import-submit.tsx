import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { useProjectImport } from './project-import-context';

export function ProjectImportSubmit() {
  const { state, actions } = useProjectImport();

  return (
    <div className="pt-2">
      <Button
        onClick={actions.handleImport}
        size="lg"
        variant="cta"
        className="w-full"
        disabled={
          (state.activeTab === 'file' && !state.selectedFile) ||
          (state.activeTab === 'url' && !state.packageUrl) ||
          state.isImporting
        }
      >
        {state.isImporting ? m.project_import_btn_importing() : m.project_import_btn_import()}
      </Button>
    </div>
  );
}