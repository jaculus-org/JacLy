import { JacPackagesPanel, JacPackagesProvider } from '@/features/jac-packages';

export function PackagesPanel() {
  return (
    <JacPackagesProvider>
      <JacPackagesPanel />
    </JacPackagesProvider>
  );
}
