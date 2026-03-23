import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
      primary: 'bg-black text-white hover:bg-zinc-800 shadow-lg active:scale-95',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-95 border border-zinc-200/50',
      ghost: 'hover:bg-zinc-100 text-zinc-600',
      destructive: 'bg-red-50 text-red-600 hover:bg-red-100',
    }
    
    const sizes = {
      default: 'h-14 px-8 rounded-3xl font-black tracking-tight',
      sm: 'h-10 px-4 rounded-2xl text-xs font-bold',
      lg: 'h-16 px-10 rounded-[32px] text-lg font-black',
      icon: 'h-12 w-12 rounded-full flex items-center justify-center',
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
