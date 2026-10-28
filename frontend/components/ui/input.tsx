"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Type alias for input props (replaces empty interface)
type InputProps = React.ComponentProps<"input">

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
