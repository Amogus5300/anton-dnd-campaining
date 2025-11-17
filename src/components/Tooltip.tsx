'use client'
import { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  text: string
}

export default function Tooltip({ children, text }: TooltipProps) {
  return (
    <span className="relative inline-block group">
      <span className="font-bold underline decoration-amber-500 decoration-2 underline-offset-2 cursor-help">
        {children}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black border border-amber-600 text-amber-100 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {text}
      </span>
    </span>
  )
}