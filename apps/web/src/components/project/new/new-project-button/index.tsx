import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useIntlayer } from 'react-intlayer';

export function NewProjectButton() {
  const content = useIntlayer('new-project-button');
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        navigate({ to: '/editor/new' });
      }}
      variant="outline"
      size={'lg'}
    >
      {content.createNewProject}
    </Button>
  );
}
