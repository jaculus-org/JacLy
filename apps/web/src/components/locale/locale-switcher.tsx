import { getLocaleName } from 'intlayer';
import { useLocale } from 'react-intlayer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LocaleSwitcher() {
  const { locale, availableLocales, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {getLocaleName(locale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLocales.map(localeItem => (
          <DropdownMenuItem
            key={localeItem}
            onClick={() => setLocale(localeItem)}
          >
            {getLocaleName(localeItem)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
