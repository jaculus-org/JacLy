export {
  useWokwiSimulator,
  WokwiSimulatorContext,
  type WokwiSimulatorActions,
  type WokwiSimulatorContextValue,
  type WokwiSimulatorMeta,
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

import { WokwiSimulatorProvider } from './state/simulator-provider';
import { WokwiSimulatorEmbed, WokwiSimulatorView } from './components';

export const WokwiSimulatorDomain = {
  Provider: WokwiSimulatorProvider,
  View: WokwiSimulatorView,
  Embed: WokwiSimulatorEmbed,
};
