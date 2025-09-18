import { createFileRoute } from '@tanstack/react-router';
import { useLocale } from 'react-intlayer';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/en')({
  component: EnRoute,
});

function EnRoute() {
  const { setLocale } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    setLocale('en');
    navigate({ to: '/', replace: true });
  }, [setLocale, navigate]);

  return null;
}
