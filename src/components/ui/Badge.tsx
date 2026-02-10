import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'text-foreground border border-border',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-normal',
        'transition-colors duration-[--duration-fast] ease-[--ease-out]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
