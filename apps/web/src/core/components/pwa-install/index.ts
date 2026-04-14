export { PwaInstallButton } from './pwa-install-button';
export { usePwaInstall } from './pwa-install-context';
export { PwaInstallProvider } from './pwa-install-provider';

import { PwaInstallButton } from './pwa-install-button';
import { PwaInstallProvider } from './pwa-install-provider';

export const PwaInstall = {
  Provider: PwaInstallProvider,
  Button: PwaInstallButton,
};
