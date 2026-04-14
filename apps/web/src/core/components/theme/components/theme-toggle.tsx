import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/tooltip';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-8 w-8">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">{m.theme_toggle_label()}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{m.theme_toggle_label()}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          {m.theme_light()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          {m.theme_dark()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          {m.theme_system()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
