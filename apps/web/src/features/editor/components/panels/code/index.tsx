import { useEditor } from '@/features/editor/provider/layout-provider';

export function CodePanel() {
  const { controlPanel } = useEditor();

  return (
    <>
      <button onClick={() => controlPanel('file-explorer', 'collapse')}>
        Close Code Panel
      </button>
    </>
  );
}
