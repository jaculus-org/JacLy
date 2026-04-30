export {
  useWokwiSimulator,
  WOKWI_EMBED_URL,
  WokwiSimulatorContext,
  type WokwiSimulatorContextValue,
  type WokwiSimulatorState,
} from '@jaculus/wokwi';
export {
  WokwiSimulator,
  WokwiSimulatorEmbed,
  WokwiSimulatorLoading,
  WokwiSimulatorView,
} from './components';
export { WokwiPanel } from './components/panels/wokwi-panel';
export { WokwiSimulatorProvider } from './state/simulator-provider';

import { WokwiSimulatorEmbed, WokwiSimulatorView } from './components';
import { WokwiSimulatorProvider } from './state/simulator-provider';

export const WokwiSimulatorDomain = {
  Provider: WokwiSimulatorProvider,
  View: WokwiSimulatorView,
  Embed: WokwiSimulatorEmbed,
};
