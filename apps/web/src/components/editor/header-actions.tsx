import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ConnectionSelector } from '../device/connection-selector';

interface EditorHeaderActionsProps {
  onBuild?: () => void;
}

export function EditorHeaderActions({ onBuild }: EditorHeaderActionsProps) {
  return (
    <>
      <ConnectionSelector oneLine={true} />
      <Button variant="default" size="sm" className="gap-2" onClick={onBuild}>
        <Upload className="h-4 w-4" />
        Build
      </Button>
    </>
  );
}
