import { type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/shared/supabase/client-middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response: supabaseResponse } = createMiddlewareClient(request);

  // Refresh the session to keep auth tokens up to date
  // This ensures getSession() and getUser() calls in Server Components get fresh data
  await supabase.auth.getSession();

  // Return the response with updated cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
