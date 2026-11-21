import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canAccessRoute, getDashboardRoute } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let public assets, API routes, and static pages through
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

  // Resolve user role: check public.profiles first, fallback to user_metadata, then 'customer'
  let userRole: UserRole = 'customer';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role) {
      userRole = profile.role as UserRole;
    } else if (user.user_metadata?.role) {
      userRole = user.user_metadata.role as UserRole;
    }
  }

  // If authenticated user visits auth routes (login/register), redirect to their appropriate dashboard
  if (user && isAuthRoute) {
    const destination = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // If authenticated user accesses protected area, verify role permissions
  if (user && isProtectedRoute) {
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
