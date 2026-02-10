import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional stagger delay index for lists */
  index?: number
}

function Skeleton({ className, index = 0, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-[--radius-md]', className)}
      style={{
        animationDelay: `${index * 80}ms`,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Pre-built skeleton for a card-like row (event, email, etc.) */
function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <div className="flex items-start gap-4 rounded-[--radius-lg] border border-border p-4">
      <Skeleton className="h-10 w-14 shrink-0" index={index} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" index={index} />
        <Skeleton className="h-3 w-1/2" index={index} />
        <Skeleton className="h-3 w-1/3" index={index} />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard }
