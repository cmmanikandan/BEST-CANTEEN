import { NextRequest, NextResponse } from 'next/server';

// Role-based route protection via middleware
// Admin → /admin/*   (only admin role)
// Server → /server/* (only server role, but server/login is public)
// Customer → /customer/* (customer role or default)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get role from cookie (set by AuthContext on login)
  const role = request.cookies.get('bc_user_role')?.value;

  // ── Instant root redirect for logged-in users (eliminates landing page flash) ──
  if (pathname === '/') {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (role === 'server') {
      return NextResponse.redirect(new URL('/server/dashboard', request.url));
    }
    if (role === 'customer') {
      return NextResponse.redirect(new URL('/customer/home', request.url));
    }
  }

  // ── Admin protection ──
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Server protection ──
  if (pathname.startsWith('/server') && pathname !== '/server/login') {
    if (role !== 'server') {
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/server/:path*'],
};
