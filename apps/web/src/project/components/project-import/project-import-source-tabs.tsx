import { LinkIcon, UploadIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/tabs';
import { useProjectImport } from './project-import-context';
import { ProjectImportFileDrop } from './project-import-file-drop';
import { ProjectImportUrlInput } from './project-import-url-input';

export function ProjectImportSourceTabs() {
  const { state, actions } = useProjectImport();

  return (
    <Tabs
      value={state.activeTab}
      onValueChange={(value) => actions.setActiveTab(value as 'file' | 'url')}
      className="flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-2" variant="default">
        <TabsTrigger value="file">
          <UploadIcon className="mr-2 size-4" />
          {m.project_import_tab_file()}
        </TabsTrigger>
        <TabsTrigger value="url">
          <LinkIcon className="mr-2 size-4" />
          {m.project_import_tab_url()}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="file" className="mt-4">
        <ProjectImportFileDrop />
      </TabsContent>

      <TabsContent value="url" className="mt-4">
        <ProjectImportUrlInput />
      </TabsContent>
    </Tabs>
  );
}