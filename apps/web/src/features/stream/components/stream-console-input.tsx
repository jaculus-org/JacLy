import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { Textarea } from '@/features/shared/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip';
import { ChevronDown, Send } from 'lucide-react';
import type { KeyboardEvent } from 'react';

interface StreamConsoleInputProps {
  input: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onExpand: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function StreamConsoleInput({
  input,
  disabled,
  onChange,
  onSubmit,
  onExpand,
  onKeyDown,
}: StreamConsoleInputProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Textarea
        placeholder={m.terminal_placeholder()}
        value={input}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-8 flex-1 resize-none py-1.5"
        rows={1}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onSubmit} size="default" disabled={disabled}>
            <Send />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{m.terminal_send()}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="default" onClick={onExpand}>
            <ChevronDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{m.terminal_expand()}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
