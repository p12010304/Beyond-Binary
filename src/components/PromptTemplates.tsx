import { Mail, FileText, Calendar, MessageSquare, Users, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface PromptTemplate {
  id: string
  icon: React.ElementType
  label: string
  description: string
  prompt: string
  colorFg: string
  colorBg: string
}

export const templates: PromptTemplate[] = [
  {
    id: 'draft-email',
    icon: Mail,
    label: 'Draft Email',
    description: 'Write a professional email',
    prompt: 'Help me draft a professional email about: ',
    colorFg: 'text-[--color-cat-1]',
    colorBg: 'bg-[--color-cat-1-bg]',
  },
  {
    id: 'summarize-doc',
    icon: FileText,
    label: 'Summarize Document',
    description: 'Get a concise summary',
    prompt: 'Please summarize the following text in simple, clear language: ',
    colorFg: 'text-[--color-cat-2]',
    colorBg: 'bg-[--color-cat-2-bg]',
  },
  {
    id: 'schedule-meeting',
    icon: Calendar,
    label: 'Schedule Meeting',
    description: 'Plan and schedule a meeting',
    prompt: 'Help me plan and schedule a meeting about: ',
    colorFg: 'text-[--color-cat-3]',
    colorBg: 'bg-[--color-cat-3-bg]',
  },
  {
    id: 'reply-message',
    icon: MessageSquare,
    label: 'Reply to Message',
    description: 'Draft a reply',
    prompt: 'Help me write a polite and clear reply to this message: ',
    colorFg: 'text-[--color-cat-4]',
    colorBg: 'bg-[--color-cat-4-bg]',
  },
  {
    id: 'meeting-agenda',
    icon: ClipboardList,
    label: 'Create Agenda',
    description: 'Generate a meeting agenda',
    prompt: 'Create a structured meeting agenda for a meeting about: ',
    colorFg: 'text-[--color-cat-5]',
    colorBg: 'bg-[--color-cat-5-bg]',
  },
  {
    id: 'social-script',
    icon: Users,
    label: 'Social Script',
    description: 'Practice workplace conversations',
    prompt: 'Help me prepare what to say in this workplace situation: ',
    colorFg: 'text-[--color-cat-6]',
    colorBg: 'bg-[--color-cat-6-bg]',
  },
]

interface PromptTemplatesProps {
  onSelect: (template: PromptTemplate) => void
  className?: string
}

export default function PromptTemplates({ onSelect, className }: PromptTemplatesProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3', className)} role="list" aria-label="Prompt templates">
      {templates.map((template) => (
        <Button
          key={template.id}
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-3 sm:p-4 text-left whitespace-normal overflow-hidden min-w-0"
          onClick={() => onSelect(template)}
          role="listitem"
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[--radius-sm] ${template.colorBg}`}>
            <template.icon className={`h-4 w-4 ${template.colorFg}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-sm font-medium leading-tight truncate">{template.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
          </div>
        </Button>
      ))}
    </div>
  )
}
