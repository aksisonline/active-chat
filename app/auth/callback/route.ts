import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') || '/'

  // Redirect to the intended destination after OAuth callback
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

