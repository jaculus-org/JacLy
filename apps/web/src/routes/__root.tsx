import { createRootRouteWithContext, redirect } from '@tanstack/react-router';
import { NotFoundPage } from '@/routes/not-found';
import type { RouterContext } from '@/app/router-context';
import { RootLayout } from '@/app/root-layout';
import { getLocale, shouldRedirect } from '@/core/paraglide/runtime';

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
