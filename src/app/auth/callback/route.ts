import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect_to');

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

  // Validate and sanitize the redirect URL
  let finalRedirectTo = '/';

  if (redirectTo) {
    try {
      const decodedRedirect = decodeURIComponent(redirectTo);
      // Basic validation to prevent open redirects
      if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
        finalRedirectTo = decodedRedirect;
      }
    } catch (error) {
      console.error('Error decoding redirect URL:', error);
    }
  }

  console.log('Redirecting to:', finalRedirectTo);
  return NextResponse.redirect(`${requestUrl.origin}${finalRedirectTo}`);
}
