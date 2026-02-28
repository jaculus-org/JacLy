import { m } from '@/paraglide/messages';
import { Field, FieldLabel } from '@/features/shared/components/ui/field';
import { Progress } from '@/features/shared/components/ui/progress';
import { useInstaller } from '../installer-context';

export function InstallerProgress() {
  const { state } = useInstaller();

  if (!state.flashProgress) return null;

  const progressLabel = (() => {
    switch (state.flashProgress?.stage) {
      case 'downloading':
        return m.installer_progress_downloading();
      case 'extracting':
        return m.installer_progress_extracting();
      case 'flashing':
        return m.installer_progress_flashing({
          fileName: state.flashProgress.fileName,
          fileIndex: (state.flashProgress.fileIndex + 1).toString(),
          totalFiles: state.flashProgress.totalFiles.toString(),
        });
      default:
        return m.installer_progress_processing();
    }
  })();

  return (
    <Field className="w-full">
      <FieldLabel htmlFor="flash-progress">
        <span>{progressLabel}</span>
        <span className="ml-auto">
          {state.flashProgress.percentage.toFixed(0)}%
        </span>
      </FieldLabel>
      <Progress value={state.flashProgress.percentage} id="flash-progress" />
    </Field>
  );
}
