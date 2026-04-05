export { CollapsibleCardContent } from './collapsible-card-content';
export {
  useCollapsibleCard,
  type CollapsibleCardActions,
  type CollapsibleCardContextValue,
  type CollapsibleCardMeta,
  type CollapsibleCardState,
} from './collapsible-card-context';
export { CollapsibleCardHeader } from './collapsible-card-header';
export { CollapsibleCardProvider } from './collapsible-card-provider';
export { CollapsibleCardRoot } from './collapsible-card-root';

import { CollapsibleCardContent } from './collapsible-card-content';
import { CollapsibleCardHeader } from './collapsible-card-header';
import { CollapsibleCardProvider } from './collapsible-card-provider';
import { CollapsibleCardRoot } from './collapsible-card-root';

export const CollapsibleCard = Object.assign(CollapsibleCardRoot, {
  Provider: CollapsibleCardProvider,
  Header: CollapsibleCardHeader,
  Content: CollapsibleCardContent,
});
