// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Lista ścieżek do zablokowania
  const blockedPaths = ['/wp-json', '/wp-admin', '/xmlrpc.php', '/cennik.html'];

  if (blockedPaths.some((path) => url.pathname.startsWith(path))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
