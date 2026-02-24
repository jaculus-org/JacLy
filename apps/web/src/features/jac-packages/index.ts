export { JacPackagesAddCard } from './components/jac-packages-add-card';
export { JacPackagesErrorCard } from './components/jac-packages-error-card';
export { JacPackagesInstallButton } from './components/jac-packages-install-button';
export { JacPackagesInstalledCard } from './components/jac-packages-installed-card';
export { JacPackagesPanel } from './components/jac-packages-panel';
export { useJacPackages } from './jac-packages-context';
export { JacPackagesProvider } from './jac-packages-provider';

import { JacPackagesAddCard } from './components/jac-packages-add-card';
import { JacPackagesErrorCard } from './components/jac-packages-error-card';
import { JacPackagesInstallButton } from './components/jac-packages-install-button';
import { JacPackagesInstalledCard } from './components/jac-packages-installed-card';
import { JacPackagesPanel } from './components/jac-packages-panel';
import { JacPackagesProvider } from './jac-packages-provider';

export const JacPackages = {
  Provider: JacPackagesProvider,
  Panel: JacPackagesPanel,
  AddCard: JacPackagesAddCard,
  ErrorCard: JacPackagesErrorCard,
  InstallButton: JacPackagesInstallButton,
  InstalledCard: JacPackagesInstalledCard,
};
