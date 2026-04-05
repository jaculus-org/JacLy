export {
  useJacPackages,
  JacPackagesContext,
  type JacPackagesActions,
  type JacPackagesContextValue,
  type JacPackagesMeta,
  type JacPackagesState,
} from './state/packages-context';
export { JacPackagesProvider } from './state/packages-provider';
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

export { JacPackagesAddCard } from './components/packages-add-card';
export { JacPackagesErrorCard } from './components/packages-error-card';
export { JacPackagesInstallButton } from './components/packages-install-button';
export { JacPackagesInstalledCard } from './components/packages-installed-card';
export { JacPackagesPanel } from './components/packages-panel';
export { InstallerControls } from './components/installer/installer-controls';
export { InstallerDialog } from './components/installer/installer-dialog';
export { InstallerLayout } from './components/installer/installer-layout';
export { InstallerProgress } from './components/installer/installer-progress';
export { InstallerPanel } from './components/panels/installer-panel';

import { JacPackagesAddCard } from './components/packages-add-card';
import { JacPackagesErrorCard } from './components/packages-error-card';
import { JacPackagesInstallButton } from './components/packages-install-button';
import { JacPackagesInstalledCard } from './components/packages-installed-card';
import { JacPackagesPanel } from './components/packages-panel';
import { InstallerControls } from './components/installer/installer-controls';
import { InstallerDialog } from './components/installer/installer-dialog';
import { InstallerLayout } from './components/installer/installer-layout';
import { InstallerProgress } from './components/installer/installer-progress';
import { JacPackagesProvider } from './state/packages-provider';
import { InstallerProvider } from './state/installer-provider';

export const JacPackages = {
  Provider: JacPackagesProvider,
  Panel: JacPackagesPanel,
  AddCard: JacPackagesAddCard,
  ErrorCard: JacPackagesErrorCard,
  InstallButton: JacPackagesInstallButton,
  InstalledCard: JacPackagesInstalledCard,
};

export const Installer = {
  Provider: InstallerProvider,
  Controls: InstallerControls,
  Dialog: InstallerDialog,
  Layout: InstallerLayout,
  Progress: InstallerProgress,
};
