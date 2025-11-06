import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ConnectionSelector } from '../device/connection-selector';
import type { AddToTerminal } from '@/hooks/terminal-store';
import type { JacDevice } from '@jaculus/device';

interface EditorHeaderActionsProps {
  onBuildFlashMonitor?: () => void;
  addToTerminal: AddToTerminal;
  device: JacDevice | null;
  setDevice: (device: JacDevice | null) => void;
}

export function EditorHeaderActions({
  onBuildFlashMonitor: onBuildFlashMonitor,
  addToTerminal,
  device,
  setDevice,
}: EditorHeaderActionsProps) {
  return (
    <>
      <ConnectionSelector
        oneLine={true}
        addToTerminal={addToTerminal}
        device={device}
        setDevice={setDevice}
      />
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
