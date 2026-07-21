'use client'

import { Menu, Volume2, VolumeX } from 'lucide-react'

type ChatHeaderProps = {
  onOpenSidebar: () => void
  voiceEnabled: boolean
  onToggleVoice: () => void
}

export function ChatHeader({
  onOpenSidebar,
  voiceEnabled,
  onToggleVoice,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="leading-tight">
          <h2 className="text-sm font-semibold tracking-tight">
            VYRON AI Assistant
          </h2>

          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>

            <span className="text-xs text-muted-foreground">
              Online
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleVoice}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
          voiceEnabled
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
        aria-label={
          voiceEnabled
            ? 'Turn off VYRON voice'
            : 'Turn on VYRON voice'
        }
        aria-pressed={voiceEnabled}
        title={
          voiceEnabled
            ? 'Voice replies are on'
            : 'Voice replies are off'
        }
      >
        {voiceEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}

        <span className="hidden sm:inline">
          Voice {voiceEnabled ? 'On' : 'Off'}
        </span>
      </button>
    </header>
  )
}