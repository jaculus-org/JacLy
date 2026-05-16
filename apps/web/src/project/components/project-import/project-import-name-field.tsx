import { m } from '@/core/paraglide/messages';
import { Input } from '@/ui/components/input';
import { ProjectFormSection } from '@/ui';
import { useProjectImport } from './project-import-context';

export function ProjectImportNameField() {
  const { state, actions } = useProjectImport();

  return (
    <ProjectFormSection title={m.project_new_name_label()}>
      <Input
        value={state.projectName}
        onChange={(e) => actions.setProjectName(e.target.value)}
        placeholder={m.project_new_name_placeholder()}
        autoFocus
        className="h-11 text-base"
      />
    </ProjectFormSection>
  );
}