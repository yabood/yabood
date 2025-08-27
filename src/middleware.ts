import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedRoutes = ["/admin", "/compose"];
  const pathname = context.url.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const session = await getSession(context.request);
    
    if (!session) {
      return context.redirect("/login");
    }
  }
  
  return next();
});