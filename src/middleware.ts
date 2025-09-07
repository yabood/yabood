import type { MiddlewareHandler } from 'astro';
import { getUserFromToken, isAdmin } from './utils/auth';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const protectedRoutes = ['/admin', '/profile', '/dashboard'];
  const adminOnlyRoutes = ['/admin'];
  const pathname = new URL(context.request.url).pathname;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminOnlyRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
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

    // Add role information to the user
    if (session.accessToken) {
      const authUser = getUserFromToken(session.accessToken);
      if (authUser) {
        session.user = {
          ...session.user,
          role: authUser.role,
        };
      }
    }

    // Check admin access for admin-only routes
    if (isAdminRoute) {
      if (!session.accessToken) {
        return context.redirect('/auth/signin');
      }
      const authUser = getUserFromToken(session.accessToken);
      if (!isAdmin(authUser)) {
        return context.redirect('/?error=unauthorized');
      }
    }

    context.locals.session = session;
    context.locals.user = session.user;
  }

  return next();
};
