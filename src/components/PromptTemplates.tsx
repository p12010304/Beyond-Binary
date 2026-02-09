import { Mail, FileText, Calendar, MessageSquare, Users, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface PromptTemplate {
  id: string
  icon: React.ElementType
  label: string
  description: string
  prompt: string
  color: string
}

export const templates: PromptTemplate[] = [
  {
    id: 'draft-email',
    icon: Mail,
    label: 'Draft Email',
    description: 'Write a professional email',
    prompt: 'Help me draft a professional email about: ',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    id: 'summarize-doc',
    icon: FileText,
    label: 'Summarize Document',
    description: 'Get a concise summary of text',
    prompt: 'Please summarize the following text in simple, clear language: ',
    color: 'text-green-600 bg-green-100',
  },
  {
    id: 'schedule-meeting',
    icon: Calendar,
    label: 'Schedule Meeting',
    description: 'Get help planning a meeting',
    prompt: 'Help me plan and schedule a meeting about: ',
    color: 'text-orange-600 bg-orange-100',
  },
  {
    id: 'reply-message',
    icon: MessageSquare,
    label: 'Reply to Message',
    description: 'Draft a reply to a message',
    prompt: 'Help me write a polite and clear reply to this message: ',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    id: 'meeting-agenda',
    icon: ClipboardList,
    label: 'Create Agenda',
    description: 'Generate a meeting agenda',
    prompt: 'Create a structured meeting agenda for a meeting about: ',
    color: 'text-cyan-600 bg-cyan-100',
  },
  {
    id: 'social-script',
    icon: Users,
    label: 'Social Script',
    description: 'Practice workplace conversations',
    prompt: 'Help me prepare what to say in this workplace situation: ',
    color: 'text-pink-600 bg-pink-100',
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
          className="h-auto flex-col items-start gap-2 p-4 text-left"
          onClick={() => onSelect(template)}
          role="listitem"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${template.color}`}>
            <template.icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">{template.label}</p>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </Button>
      ))}
    </div>
  )
}
