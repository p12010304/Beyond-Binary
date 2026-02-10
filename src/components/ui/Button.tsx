import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const variantClasses: Record<string, string> = {
  default:
    'bg-primary text-primary-foreground neu-raised hover:brightness-105 active:translate-y-px active:shadow-none',
  destructive:
    'bg-destructive text-destructive-foreground hover:brightness-105 active:translate-y-px',
  outline:
    'border border-border bg-card/60 backdrop-blur-sm hover:bg-secondary hover:text-secondary-foreground active:translate-y-px',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:translate-y-px',
  ghost:
    'hover:bg-secondary/70 hover:text-secondary-foreground',
  link:
    'text-primary underline-offset-4 hover:underline',
}

const sizeClasses: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 text-xs',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[--radius-md] text-sm font-medium',
          'transition-all duration-[--duration-fast] ease-[--ease-out]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
