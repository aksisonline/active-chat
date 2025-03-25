import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');

  if (token) {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      const user = userCredential.user;
      // Set a cookie with the user's ID token
      const idToken = await user.getIdToken();
      cookies().set('token', idToken, { httpOnly: true });
    } catch (error) {
      console.error('Error signing in with custom token:', error);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
