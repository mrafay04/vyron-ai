'use client'

import { Calendar, Globe, Mail, Sheet, type LucideIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { NovaLogo } from './nova-logo'

type QuickAction = {
  title: string
  description: string
  icon: LucideIcon
  prompt: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Summarize unread emails',
    description: 'Get a quick digest of what needs your attention',
    icon: Mail,
    prompt: 'Summarize my unread emails from today.',
  },
  {
    title: "Show today's calendar",
    description: 'Review your meetings and free blocks',
    icon: Calendar,
    prompt: "What's on my calendar today?",
  },
  {
    title: 'Analyze Google Sheet',
    description: 'Surface trends and insights from your data',
    icon: Sheet,
    prompt: 'Analyze my Q3 revenue Google Sheet and highlight key trends.',
  },
  {
    title: 'Search the web',
    description: 'Find fresh, reliable answers in seconds',
    icon: Globe,
    prompt: 'Search the web for the latest AI product launches this week.',
  },
]

export function WelcomeSection({
  onAction,
}: {
  onAction: (prompt: string) => void
}) {
  const { data: session } = useSession()

  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] || 'there'

  const hour = new Date().getHours()

  let greeting = 'Hello'

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning'
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon'
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening'
  } else {
    greeting = 'Good Night'
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 text-center sm:py-16">
      <NovaLogo className="h-14 w-14" />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {greeting}, {firstName}
      </h1>

      <p className="mt-2 text-lg text-muted-foreground text-pretty sm:text-xl">
        How can I help you today?
      </p>

      <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.title}
              onClick={() => onAction(action.prompt)}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {action.title}
                </span>

                <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">
                  {action.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}