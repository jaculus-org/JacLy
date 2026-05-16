import { Blocks, Loader2, Package } from 'lucide-react';
import { m } from '@/core/paraglide/messages';

export type JaclyEditorLoadPhase = 'installing-packages' | 'loading-editor';

interface JaclyEditorLoadingProps {
  phase: JaclyEditorLoadPhase;
}

export function JaclyEditorLoading({ phase }: JaclyEditorLoadingProps) {
  const isInstalling = phase === 'installing-packages';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-medium text-foreground">
          {isInstalling ? m.editor_jacly_installing_header() : m.editor_jacly_loading_header()}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isInstalling ? m.editor_jacly_installing_desc() : m.editor_jacly_loading_desc()}
        </p>
        {isInstalling ? (
          <Package className="h-16 w-16 text-muted-foreground/30" />
        ) : (
          <Blocks className="h-16 w-16 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}
