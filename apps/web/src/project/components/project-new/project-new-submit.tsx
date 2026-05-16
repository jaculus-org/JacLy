import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { useProjectNew } from './project-new-context';

export function ProjectNewSubmit() {
  const { state, actions, meta } = useProjectNew();

  return (
    <div className="pt-2">
      <Button
        onClick={actions.createProject}
        size="lg"
        variant="cta"
        className="w-full"
        disabled={!meta.canSubmit}
      >
        {state.isCreating ? m.project_new_btn_creating() : m.project_new_btn_create()}
      </Button>
    </div>
  );
}
