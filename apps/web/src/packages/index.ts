export { JacPackagesAddCard } from './components/packages-add-card';
export { JacPackagesErrorCard } from './components/packages-error-card';
export { JacPackagesInstallButton } from './components/packages-install-button';
export { JacPackagesInstalledCard } from './components/packages-installed-card';
export { JacPackagesPanel } from './components/packages-panel';
export { packageEventsService } from './services/package-events-service';
export {
  type JacPackagesActions,
  JacPackagesContext,
  type JacPackagesContextValue,
  type JacPackagesMeta,
  type JacPackagesState,
  useJacPackages,
} from './state/packages-context';
export { JacPackagesProvider } from './state/packages-provider';

import { JacPackagesAddCard } from './components/packages-add-card';
import { JacPackagesErrorCard } from './components/packages-error-card';
import { JacPackagesInstallButton } from './components/packages-install-button';
import { JacPackagesInstalledCard } from './components/packages-installed-card';
import { JacPackagesPanel } from './components/packages-panel';

import { JacPackagesProvider } from './state/packages-provider';

export const JacPackages = {
  Provider: JacPackagesProvider,
  Panel: JacPackagesPanel,
  AddCard: JacPackagesAddCard,
  ErrorCard: JacPackagesErrorCard,
  InstallButton: JacPackagesInstallButton,
  InstalledCard: JacPackagesInstalledCard,
};
