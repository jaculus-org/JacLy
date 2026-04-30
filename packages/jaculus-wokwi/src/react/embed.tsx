import { WOKWI_EMBED_URL } from '../constants';

interface WokwiEmbedProps {
  url?: string;
  isInitializing?: boolean;
  className?: string;
  id?: string;
}

export function WokwiEmbed({
  url = WOKWI_EMBED_URL,
  isInitializing,
  className,
  id,
}: WokwiEmbedProps) {
  return (
    <iframe
      id={id}
      src={url}
      width="100%"
      height="100%"
      className={className}
      aria-busy={isInitializing}
    />
  );
}
