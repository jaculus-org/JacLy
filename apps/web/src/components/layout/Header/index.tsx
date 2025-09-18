import { Link } from '@tanstack/react-router';
import { ModeToggle } from '../theme/ModeToggle';
import { LocaleSwitcher } from '../../locale/locale-switcher';
import { useIntlayer, useLocale } from 'react-intlayer';
import { Button } from '@/components/ui/button';

export function Header() {
  const content = useIntlayer('header');
  const { locale, setLocale } = useLocale();

  const links = [
    { name: content.home as string, path: '/' },
    { name: content.blocks as string, path: '/editor/234' },
  ];

  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center py-3 px-4">
          {/* Navigation */}
          <nav className="flex gap-6">
            {links.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
              >
                {name}
              </Link>
            ))}
          </nav>

          {/* Theme switcher */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            <LocaleSwitcher />
            <Button
              onClick={() =>
                locale === 'en' ? setLocale('cs') : setLocale('en')
              }
            >
              {locale === 'en' ? 'CS' : 'EN'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
