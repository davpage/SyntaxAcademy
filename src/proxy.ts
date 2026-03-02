import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getToken} from 'next-auth/jwt';

import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// next-intl middleware
const intlMiddleware = createMiddleware(routing);

const AUTH_PAGES = new Set([
  'login',
  'register',
  'verify',
  'reset-request',
  'reset-password'
]);

function stripLocale(pathname: string) {
  for (const l of routing.locales) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      return { locale: l, rest: pathname.slice(l.length + 1) || '/' };
    }
  }
  return { locale: routing.defaultLocale, rest: pathname || '/' };
}

export default async function proxy(req: NextRequest) {
  // 1) next-intl rewrite/redirect
  const res = intlMiddleware(req);

  // 2) auth checks
  const { pathname, search } = req.nextUrl;
  const { locale, rest } = stripLocale(pathname);
  const firstSeg = rest.split('/').filter(Boolean)[0] ?? '';

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // authenticated -> block auth pages
  if (token && AUTH_PAGES.has(firstSeg)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // guest -> block protected pages
  if (!token && (firstSeg === 'dashboard' || firstSeg === 'settings')) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  // 3) no redirect -> return intl response
  return res;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};