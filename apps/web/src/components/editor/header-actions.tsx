import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ConnectionSelector } from '../device/connection-selector';
import type { AddToTerminal } from '@/hooks/terminal-store';

interface EditorHeaderActionsProps {
  onBuildFlashMonitor?: () => void;
  addToTerminal: AddToTerminal;
}

export function EditorHeaderActions({
  onBuildFlashMonitor: onBuildFlashMonitor,
  addToTerminal,
}: EditorHeaderActionsProps) {
  return (
    <>
      <ConnectionSelector oneLine={true} addToTerminal={addToTerminal} />
      <Button
        variant="default"
        size="sm"
        className="gap-2"
        onClick={onBuildFlashMonitor}
      >
        <Upload className="h-4 w-4" />
        Build & Flash & Monitor
      </Button>
    </>
  );
}
