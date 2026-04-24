"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div 
      className={cn(
        "relative overflow-auto custom-scrollbar",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
