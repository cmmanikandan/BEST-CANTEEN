import { NextRequest, NextResponse } from 'next/server';

// Role-based route protection via middleware
// Admin → /admin/*   (only admin role)
// Server → /server/* (only server role, but server/login is public)
// Customer → /customer/* (customer role or default)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get role from cookie (set by AuthContext on login)
  const role = request.cookies.get('bc_user_role')?.value;

  // ── Admin protection ──
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
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
  matcher: ['/admin/:path*', '/server/:path*'],
};
