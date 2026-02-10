import { Build } from './build';
import { BuildFlash } from './build-flash';
import { ConsoleSelector } from './console-selector';

export function ConnectedDevice() {
  return (
    <>
      <Build />
      <BuildFlash />
      <ConsoleSelector />
    </>
  );
}
