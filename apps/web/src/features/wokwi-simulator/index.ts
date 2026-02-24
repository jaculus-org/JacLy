export {
  useWokwiSimulator,
  type WokwiSimulatorActions,
  type WokwiSimulatorContextValue,
  type WokwiSimulatorMeta,
  type WokwiSimulatorState,
} from './wokwi-simulator-context';
export { WokwiSimulatorProvider } from './wokwi-simulator-provider';
export {
  WokwiSimulator,
  WokwiSimulatorEmbed,
  WokwiSimulatorView,
} from './components';

import { WokwiSimulatorProvider } from './wokwi-simulator-provider';
import { WokwiSimulatorEmbed, WokwiSimulatorView } from './components';

export const WokwiSimulatorDomain = {
  Provider: WokwiSimulatorProvider,
  View: WokwiSimulatorView,
  Embed: WokwiSimulatorEmbed,
};
