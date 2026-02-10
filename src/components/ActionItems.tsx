import { CheckCircle, Circle, Clock } from 'lucide-react'
import type { ActionItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ActionItemsProps {
  items: ActionItem[]
  onToggle?: (index: number) => void
  className?: string
}

export default function ActionItems({ items, onToggle, className }: ActionItemsProps) {
  if (items.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground py-4 text-center', className)}>
        No action items extracted yet.
      </div>
    )
  }

  return (
    <ul className={cn('space-y-2', className)} role="list" aria-label="Action items">
      {items.map((item, index) => (
        <li
          key={index}
          className={cn(
            'flex items-start gap-3 rounded-[--radius-md] border border-border p-3',
            'transition-all duration-[--duration-fast] ease-[--ease-out]',
            item.completed && 'bg-muted/50 opacity-70',
          )}
        >
          <button
            onClick={() => onToggle?.(index)}
            className="mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={item.completed ? `Mark "${item.task}" as incomplete` : `Mark "${item.task}" as complete`}
          >
            {item.completed ? (
              <CheckCircle className="h-[1.125rem] w-[1.125rem] text-success" aria-hidden="true" />
            ) : (
              <Circle className="h-[1.125rem] w-[1.125rem] text-muted-foreground" aria-hidden="true" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm leading-relaxed', item.completed && 'line-through text-muted-foreground')}>
              {item.task}
            </p>
            {item.due && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>Due: {new Date(item.due).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
