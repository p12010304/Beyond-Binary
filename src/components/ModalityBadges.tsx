/**
 * Modality badges: shows available interaction modes for a feature.
 * Active modes (based on user's output_mode) are highlighted; inactive are dimmed.
 * Makes multimodality explicit and visible at a glance.
 */

import { Type, Volume2, Eye, Vibrate } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccessibility } from '@/components/AccessibilityProvider'

type Modality = 'text' | 'voice' | 'visual' | 'haptic'

const modalityMeta: Record<Modality, { icon: React.ElementType; label: string; outputModeKey: string }> = {
  text: { icon: Type, label: 'Text', outputModeKey: 'visual' },
  voice: { icon: Volume2, label: 'Voice', outputModeKey: 'voice' },
  visual: { icon: Eye, label: 'Visual', outputModeKey: 'visual' },
  haptic: { icon: Vibrate, label: 'Haptic', outputModeKey: 'haptic' },
}

interface ModalityBadgesProps {
  /** Which modalities this feature supports */
  available?: Modality[]
  className?: string
  /** Compact mode: icons only, no labels */
  compact?: boolean
}

export default function ModalityBadges({
  available = ['text', 'voice', 'visual', 'haptic'],
  className,
  compact = false,
}: ModalityBadgesProps) {
  const { preferences } = useAccessibility()

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label="Available interaction modes"
      role="list"
    >
      {available.map((modality) => {
        const meta = modalityMeta[modality]
        const isActive =
          modality === 'text' || // text is always active
          preferences.output_mode.includes(meta.outputModeKey as 'voice' | 'visual' | 'haptic' | 'simplified')

        return (
          <div
            key={modality}
            role="listitem"
            className={cn(
              'flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              'transition-colors duration-[--duration-fast]',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/60 text-muted-foreground/50',
            )}
            title={`${meta.label}${isActive ? ' (active)' : ''}`}
            aria-label={`${meta.label}: ${isActive ? 'active' : 'inactive'}`}
          >
            <meta.icon className="h-3 w-3" aria-hidden="true" />
            {!compact && <span>{meta.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
