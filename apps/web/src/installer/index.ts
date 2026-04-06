export {
  useInstaller,
  InstallerContext,
  type InstallerActions,
  type InstallerContextValue,
  type InstallerMeta,
  type InstallerSourceTab,
  type InstallerState,
} from './state/installer-context';
export { InstallerProvider, baudrates } from './state/installer-provider';

export { InstallerControls } from './components/installer-controls';
export { InstallerDialog } from './components/installer-dialog';
export { InstallerLayout } from './components/installer-layout';
export { InstallerProgress } from './components/installer-progress';
export { InstallerPanel } from './components/installer-panel';

import { InstallerControls } from './components/installer-controls';
import { InstallerDialog } from './components/installer-dialog';
import { InstallerLayout } from './components/installer-layout';
import { InstallerProgress } from './components/installer-progress';
import { InstallerProvider } from './state/installer-provider';

export const Installer = {
  Provider: InstallerProvider,
  Controls: InstallerControls,
  Dialog: InstallerDialog,
  Layout: InstallerLayout,
  Progress: InstallerProgress,
};
