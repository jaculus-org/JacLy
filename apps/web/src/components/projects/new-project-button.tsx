import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export function NewProjectButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        navigate({ to: '/editor/new' });
      }}
      variant="outline"
      size={'lg'}
    >
      Create New Project
    </Button>
  );
}
