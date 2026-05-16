import { m } from '@/core/paraglide/messages';
import { Logger } from '@/core/components/logger';
import { FormPageLayout, ProjectFormSection } from '@/ui';
import { ProjectImportProvider } from './project-import-provider';
import { ProjectImportNameField } from './project-import-name-field';
import { ProjectImportSourceTabs } from './project-import-source-tabs';
import { ProjectImportSubmit } from './project-import-submit';

export function ProjectImportPage() {
  return (
    <ProjectImportProvider>
      <FormPageLayout title={m.project_import_title()}>
        <ProjectImportNameField />

        <ProjectFormSection title={m.project_import_title()}>
          <ProjectImportSourceTabs />
        </ProjectFormSection>

        <ProjectImportSubmit />

        <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
      </FormPageLayout>
    </ProjectImportProvider>
  );
}