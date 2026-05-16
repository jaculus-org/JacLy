export {
  type InstallerActions,
  InstallerContext,
  type InstallerContextValue,
  type InstallerMeta,
  type InstallerSourceTab,
  type InstallerState,
  useInstaller,
} from './installer-context';
export { InstallerControls } from './installer-controls';
export { InstallerDialog } from './installer-dialog';
export { InstallerLayout } from './installer-layout';
export { InstallerPanel } from './installer-panel';
export { InstallerProgress } from './installer-progress';
export { baudrates, InstallerProvider } from './installer-provider';

import { InstallerControls } from './installer-controls';
import { InstallerDialog } from './installer-dialog';
import { InstallerLayout } from './installer-layout';
import { InstallerProgress } from './installer-progress';
import { InstallerProvider } from './installer-provider';

export const Installer = {
  Provider: InstallerProvider,
  Controls: InstallerControls,
  Dialog: InstallerDialog,
  Layout: InstallerLayout,
  Progress: InstallerProgress,
};
