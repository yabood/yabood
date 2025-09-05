import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const protectedRoutes = ['/admin', '/profile', '/dashboard'];
  const pathname = new URL(context.request.url).pathname;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Forward cookies to the session endpoint to resolve the current session
    const sessionRes = await fetch(new URL('/api/auth/session', context.url), {
      headers: {
        cookie: context.request.headers.get('cookie') ?? '',
      },
    });

    if (!sessionRes.ok) {
      return context.redirect('/auth/signin');
    }

    const session = await sessionRes.json();
    if (!session?.user) {
      return context.redirect('/auth/signin');
    }

    context.locals.session = session;
    context.locals.user = session.user;
  }

  return next();
};
