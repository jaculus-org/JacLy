export { JacPackagesAddCard } from './packages-add-card';
export {
  type JacPackagesActions,
  JacPackagesContext,
  type JacPackagesContextValue,
  type JacPackagesMeta,
  type JacPackagesState,
  useJacPackages,
} from './packages-context';
export { JacPackagesErrorCard } from './packages-error-card';
export { JacPackagesInstallButton } from './packages-install-button';
export { JacPackagesInstalledCard } from './packages-installed-card';
export { JacPackagesPanel } from './packages-panel';
export { JacPackagesProvider } from './packages-provider';
export { packageEventsService } from './services/package-events-service';

import { JacPackagesAddCard } from './packages-add-card';
import { JacPackagesErrorCard } from './packages-error-card';
import { JacPackagesInstallButton } from './packages-install-button';
import { JacPackagesInstalledCard } from './packages-installed-card';
import { JacPackagesPanel } from './packages-panel';
import { JacPackagesProvider } from './packages-provider';

export const JacPackages = {
  Provider: JacPackagesProvider,
  Panel: JacPackagesPanel,
  AddCard: JacPackagesAddCard,
  ErrorCard: JacPackagesErrorCard,
  InstallButton: JacPackagesInstallButton,
  InstalledCard: JacPackagesInstalledCard,
};
