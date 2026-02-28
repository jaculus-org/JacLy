export { InstallerControls } from './components/installer-controls';
export { InstallerDialog } from './components/installer-dialog';
export { InstallerLayout } from './components/installer-layout';
export { InstallerProgress } from './components/installer-progress';
export { InstallerProvider, baudrates } from './installer-provider';
export { InstallerTerminal } from './components/installer-terminal';
export { useInstaller } from './installer-context';

import { InstallerControls } from './components/installer-controls';
import { InstallerDialog } from './components/installer-dialog';
import { InstallerLayout } from './components/installer-layout';
import { InstallerProgress } from './components/installer-progress';
import { InstallerProvider } from './installer-provider';
import { InstallerTerminal } from './components/installer-terminal';

export const Installer = {
  Provider: InstallerProvider,
  Layout: InstallerLayout,
  Controls: InstallerControls,
  Progress: InstallerProgress,
  Terminal: InstallerTerminal,
  Dialog: InstallerDialog,
};
