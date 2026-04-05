export {
  useWokwiSimulator,
  WokwiSimulatorContext,
  type WokwiSimulatorContextValue,
  type WokwiSimulatorState,
} from './state/simulator-context';
export { WokwiSimulatorProvider } from './state/simulator-provider';
export {
  WokwiSimulator,
  WokwiSimulatorEmbed,
  WokwiSimulatorLoading,
  WokwiSimulatorView,
} from './components';
export { WokwiPanel } from './components/panels/wokwi-panel';
export { WOKWI_EMBED_URL } from './constants';

import { WokwiSimulatorProvider } from './state/simulator-provider';
import { WokwiSimulatorEmbed, WokwiSimulatorView } from './components';

export const WokwiSimulatorDomain = {
  Provider: WokwiSimulatorProvider,
  View: WokwiSimulatorView,
  Embed: WokwiSimulatorEmbed,
};
