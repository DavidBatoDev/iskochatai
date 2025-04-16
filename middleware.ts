// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const protectedRoutes = [
  '/dashboard/chat',
  '/profile',
  '/settings',
  '/chat',
  // Add other protected routes here
];

// Define which routes are only accessible for non-authenticated users
const authRoutes = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const redirectUrl = new URL('/signin', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Handle auth routes - redirect to dashboard if already authenticated
  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard/chat/new', req.url));
  }
  
  return res;
}

// Define on which paths the middleware should run
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/chat/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Auth routes
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};