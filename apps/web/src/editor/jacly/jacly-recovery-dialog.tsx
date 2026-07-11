import { m } from '@/core/paraglide/messages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/alert-dialog';

interface JaclyRecoveryDialogProps {
  backupName: string;
  restoring: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function JaclyRecoveryDialog({
  backupName,
  restoring,
  onCancel,
  onConfirm,
}: JaclyRecoveryDialogProps) {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.editor_jacly_recovery_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.editor_jacly_recovery_description({ backupName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={restoring} onClick={onCancel}>
            {m.editor_jacly_recovery_keep()}
          </AlertDialogCancel>
          <AlertDialogAction disabled={restoring} onClick={onConfirm}>
            {restoring ? m.editor_jacly_recovery_restoring() : m.editor_jacly_recovery_replace()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
