import { createRootRouteWithContext, redirect } from '@tanstack/react-router';
import { RootLayout } from '@/app/root-layout';
import type { RouterContext } from '@/app/router-context';
import { getLocale, shouldRedirect } from '@/core/paraglide/runtime';
import { NotFoundPage } from '@/routes/not-found';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    document.documentElement.setAttribute('lang', getLocale());

    const decision = await shouldRedirect({ url: window.location.href });

    if (decision.redirectUrl) {
      throw redirect({ href: decision.redirectUrl.href });
    }
  },
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
