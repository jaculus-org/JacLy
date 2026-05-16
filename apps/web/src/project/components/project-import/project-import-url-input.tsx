import { m } from '@/core/paraglide/messages';
import { Input } from '@/ui/components/input';
import { useProjectImport } from './project-import-context';

export function ProjectImportUrlInput() {
  const { state, actions } = useProjectImport();

  return (
    <div className="space-y-3">
      <Input
        type="url"
        value={state.packageUrl}
        onChange={(e) => actions.setPackageUrl(e.target.value)}
        placeholder={m.project_import_url_placeholder()}
        className="h-11 text-base"
      />
      <p className="text-sm text-muted-foreground">{m.project_import_url_hint()}</p>
    </div>
  );
}