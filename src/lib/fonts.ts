// src/lib/fonts.ts

import localFont from 'next/font/local';

export const roboto = localFont({
  src: [
    {
      path: '../../public/fonts/Roboto-Regular.ttf',   // ← именно так, 5 точек вверх
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Roboto-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',          // важно, чтобы не было FOIT
  variable: '--font-roboto', // если хочешь использовать как переменную в tailwind/css
});