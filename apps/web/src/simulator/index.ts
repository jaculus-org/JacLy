export {
  useWokwiSimulator,
  WOKWI_EMBED_URL,
  WokwiSimulatorContext,
  type WokwiSimulatorContextValue,
  type WokwiSimulatorState,
} from '@jaculus/wokwi';
export {
  WokwiSimulatorEmbed,
  WokwiSimulatorLoading,
  WokwiSimulatorRoot,
  WokwiSimulatorView,
} from './components';
export { WokwiPanel } from './components/panels/wokwi-panel';
export { WokwiSimulatorProvider } from './state/simulator-provider';

import { WokwiSimulatorEmbed, WokwiSimulatorRoot, WokwiSimulatorView } from './components';
import { WokwiSimulatorProvider } from './state/simulator-provider';

export const WokwiSimulator = Object.assign(WokwiSimulatorRoot, {
  Provider: WokwiSimulatorProvider,
  View: WokwiSimulatorView,
  Embed: WokwiSimulatorEmbed,
});
