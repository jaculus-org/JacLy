import { FlexLayoutInstantiation } from '@/providers/flexlayout-provider';
import { useIntlayer } from 'react-intlayer';
import { JacProject } from '@/lib/project/jacProject';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from '@tanstack/react-router';

interface FlexLayoutEditorProps {
  project: JacProject | undefined;
}

export function FlexLayoutEditor({ project }: FlexLayoutEditorProps) {
  const content = useIntlayer('flexlayout');
  const navigate = useNavigate();

  if (!project) {
    enqueueSnackbar(content.projectNotFound.value, { variant: 'error' });
    navigate({ to: '/editor' });
    return null;
  }

  return <FlexLayoutInstantiation project={project} />;
}
