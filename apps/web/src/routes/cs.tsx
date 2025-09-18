import { createFileRoute } from '@tanstack/react-router';
import { useLocale } from 'react-intlayer';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/cs')({
  component: CsRoute,
});

function CsRoute() {
  const { setLocale } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    setLocale('cs');
    navigate({ to: '/', replace: true });
  }, [setLocale, navigate]);

  return null;
}
