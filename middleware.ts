// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  if (url.pathname.startsWith('/players/sheet/') && !url.pathname.startsWith('/players/sheet/mobile')) {
    const ua = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const width = request.headers.get('sec-ch-width');
    
    if (isMobile || (width && parseInt(width) < 1024)) {
      const newPath = url.pathname.replace('/players/sheet/', '/players/sheet/mobile/');
      return NextResponse.redirect(new URL(newPath + url.search, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/players/sheet/:path*',
};