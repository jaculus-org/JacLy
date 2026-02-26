import { Button } from '@/features/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/components/ui/tooltip';
import { m } from '@/paraglide/messages';
import { getLocale, locales, setLocale } from '@/paraglide/runtime';

export function LocaleSelector() {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-8 w-8">
              {getLocale().toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{m.locale_selector_label()}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {locales.map(localeItem => (
          <DropdownMenuItem
            key={localeItem}
            onClick={() => setLocale(localeItem)}
          >
            {localeItem.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
