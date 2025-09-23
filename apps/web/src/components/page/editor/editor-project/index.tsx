// import { JacProject } from '@/lib/project/jacProject';
// import { FlexLayoutProvider } from '@/providers/flexlayout-provider';
// import { useNavigate } from '@tanstack/react-router';
// import { enqueueSnackbar } from 'notistack';
// import { useIntlayer } from 'react-intlayer';

// interface EditorProjectProps {
//   project: JacProject | null;
// }

// export function EditorProject({ project }: EditorProjectProps) {
//   const content = useIntlayer('flexlayout');
//   const navigate = useNavigate();

//   if (!project) {
//     enqueueSnackbar(content.projectNotFound.value, { variant: 'error' });
//     navigate({ to: '/editor' });
//     return null;
//   }

//   return (
//     <FlexLayoutProvider>
//       <div className="h-full w-full" />
//     </FlexLayoutProvider>
//   );
// }
