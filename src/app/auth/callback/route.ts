import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`);
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`);
    }
  }

  // Redirect to a page that will handle the client-side redirect
  return NextResponse.redirect(`${requestUrl.origin}/auth/redirect`);
}
