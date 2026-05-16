import { Logger } from '@/core/components/logger';
import { m } from '@/core/paraglide/messages';
import { FormPageLayout } from '@/ui';
import { ProjectNewAdvanced } from './project-new-advanced';
import { ProjectNewNameField } from './project-new-name-field';
import { ProjectNewProvider } from './project-new-provider';
import { ProjectNewSubmit } from './project-new-submit';
import { ProjectNewTemplatePicker } from './project-new-template-picker';
import { ProjectNewTypeSelector } from './project-new-type-selector';

export function ProjectNewPage() {
  return (
    <ProjectNewProvider>
      <FormPageLayout title={m.project_new_title()}>
        <ProjectNewNameField />
        <ProjectNewTypeSelector />
        <ProjectNewTemplatePicker />
        <ProjectNewAdvanced />
        <ProjectNewSubmit />
        <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
      </FormPageLayout>
    </ProjectNewProvider>
  );
}
