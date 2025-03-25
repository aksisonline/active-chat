import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');

  if (token) {
    const auth = getAuth();
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      const user = userCredential.user;

      // Set a cookie with the user's ID token
      const idToken = await user.getIdToken();
      const cookieStore = await cookies();
      cookieStore.set('token', idToken, { httpOnly: true });
    } catch (error) {
      console.error('Error signing in with custom token:', error);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
