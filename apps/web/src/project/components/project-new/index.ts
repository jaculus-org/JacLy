export { ProjectNewAdvanced } from './project-new-advanced';
export {
  type ProjectNewActions,
  ProjectNewContext,
  type ProjectNewContextValue,
  type ProjectNewMeta,
  type ProjectNewState,
  useProjectNew,
} from './project-new-context';
export { ProjectNewNameField } from './project-new-name-field';
export { ProjectNewPage } from './project-new-page';
export { ProjectNewProvider } from './project-new-provider';
export { ProjectNewSubmit } from './project-new-submit';
export { ProjectNewTemplatePicker } from './project-new-template-picker';
export { ProjectNewTypeSelector } from './project-new-type-selector';

import { ProjectNewAdvanced } from './project-new-advanced';
import { ProjectNewNameField } from './project-new-name-field';
import { ProjectNewProvider } from './project-new-provider';
import { ProjectNewSubmit } from './project-new-submit';
import { ProjectNewTemplatePicker } from './project-new-template-picker';
import { ProjectNewTypeSelector } from './project-new-type-selector';

export const ProjectNew = {
  Provider: ProjectNewProvider,
  NameField: ProjectNewNameField,
  TypeSelector: ProjectNewTypeSelector,
  TemplatePicker: ProjectNewTemplatePicker,
  Advanced: ProjectNewAdvanced,
  Submit: ProjectNewSubmit,
};
