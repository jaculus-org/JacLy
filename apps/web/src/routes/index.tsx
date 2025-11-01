import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { t, i18n } = useTranslation('translation');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-2">
      <div className="mb-4">
        <button
          onClick={() => changeLanguage('en')}
          className={`mr-2 px-3 py-1 border rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('cs')}
          className={`px-3 py-1 border rounded ${i18n.language === 'cs' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
        >
          Čeština
        </button>
      </div>
      <p>{t($ => $.description.part2)}</p>
    </div>
  );
}
