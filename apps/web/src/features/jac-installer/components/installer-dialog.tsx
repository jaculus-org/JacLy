import { m } from '@/paraglide/messages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog';
import { useInstaller } from '../installer-context';

export function InstallerDialog() {
  const { state, actions } = useInstaller();

  return (
    <AlertDialog
      open={!!state.showPopupText}
      onOpenChange={open => !open && actions.closePopup()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.installer_dialog_title()}</AlertDialogTitle>
          <AlertDialogDescription>{state.showPopupText}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{m.installer_dialog_confirm()}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
