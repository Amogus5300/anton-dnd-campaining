// proxy.ts — новый стандарт Next.js 14
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';

  // Если зашли на /players/sheet/[id] с телефона — редирект на мобильную
  if (url.pathname.startsWith('/players/sheet/') && !url.pathname.startsWith('/players/sheet/mobile')) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    if (isMobile) {
      const mobilePath = url.pathname.replace('/players/sheet/', '/players/sheet/mobile/');
      return NextResponse.redirect(new URL(mobilePath + url.search, request.url));
    }
  }

  return NextResponse.next(); // для всего остального — пропускаем
}