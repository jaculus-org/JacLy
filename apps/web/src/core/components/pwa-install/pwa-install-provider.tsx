import { m } from '@/core/paraglide/messages';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useEffect, useEffectEvent, useState } from 'react';
// import { useRegisterSW } from 'virtual:pwa-register/react';
import { PwaInstallContext } from './pwa-install-context';

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplayMode);
  const [isInstalling, setIsInstalling] = useState(false);

  // useRegisterSW({
  //   onRegisterError(error: unknown) {
  //     console.error('Failed to register the JacLy service worker.', error);
  //   },
  // });

  const syncInstalledState = useEffectEvent(() => {
    const installed = isStandaloneDisplayMode();

    setIsInstalled(installed);

    if (installed) {
      setInstallPrompt(null);
    }
  });

  const captureInstallPrompt = useEffectEvent((event: Event) => {
    const deferredPrompt = event as BeforeInstallPromptEvent;

    deferredPrompt.preventDefault();
    setInstallPrompt(deferredPrompt);
  });

  const handleInstalled = useEffectEvent(() => {
    setIsInstalling(false);
    setInstallPrompt(null);
    syncInstalledState();
    enqueueSnackbar(m.pwa_install_success(), { variant: 'success' });
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => syncInstalledState();
    const handleBeforeInstall = (event: Event) => captureInstallPrompt(event);
    const handleAppInstalled = () => handleInstalled();

    syncInstalledState();
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  async function promptInstall() {
    if (!installPrompt || isInstalling) {
      return false;
    }
    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      setInstallPrompt(null);
      return choice.outcome === 'accepted';
    } finally {
      setIsInstalling(false);
    }
  }

  return (
    <PwaInstallContext.Provider
      value={{
        state: {
          canInstall: !isInstalled && installPrompt !== null,
          isInstalled,
          isInstalling,
        },
        actions: {
          promptInstall,
        },
        meta: {
          isSupported:
            typeof window !== 'undefined' && 'serviceWorker' in navigator,
        },
      }}
    >
      {children}
    </PwaInstallContext.Provider>
  );
}
