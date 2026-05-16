import { m } from '@/core/paraglide/messages';
import { ProjectFormSection } from '@/ui';
import { Input } from '@/ui/components/input';
import { useProjectNew } from './project-new-context';

export function ProjectNewNameField() {
  const { state, actions } = useProjectNew();

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
