import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canAccessRoute, getDashboardRoute } from '@/lib/permissions';
import type { UserRole, AccountStatus } from '@/types/database';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let public assets and static files through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/contact')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/customer') ||
    pathname.startsWith('/merchant') ||
    pathname.startsWith('/rider') ||
    pathname.startsWith('/admin');

  // If user is not authenticated and attempts to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated user visits auth routes (login/register), redirect to their dashboard
  if (user && isAuthRoute) {
    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    const destination = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // If authenticated user accesses protected area, verify role permissions
  if (user && isProtectedRoute) {
    const userRole = (user.user_metadata?.role as UserRole) || 'customer';
    if (!canAccessRoute(userRole, pathname)) {
      const destination = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
