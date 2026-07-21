'use client'

import {
  useEffect,
  useState,
} from 'react'
import { useTheme } from 'next-themes'
import {
  Languages,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsPanelProps = {
  voiceEnabled: boolean
  onToggleVoice: () => void
  speechRate: number
  onSpeechRateChange: (rate: number) => void
  speechLanguage: string
  onSpeechLanguageChange: (language: string) => void
}

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
  },
]

const languageOptions = [
  {
    value: 'en-US',
    label: 'English (United States)',
  },
  {
    value: 'en-GB',
    label: 'English (United Kingdom)',
  },
  {
    value: 'ur-PK',
    label: 'Urdu (Pakistan)',
  },
  {
    value: 'hi-IN',
    label: 'Hindi (India)',
  },
  {
    value: 'ar-SA',
    label: 'Arabic (Saudi Arabia)',
  },
]

export function SettingsPanel({
  voiceEnabled,
  onToggleVoice,
  speechRate,
  onSpeechRateChange,
  speechLanguage,
  onSpeechLanguageChange,
}: SettingsPanelProps) {
  const [mounted, setMounted] = useState(false)

  const {
    theme,
    setTheme,
  } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage VYRON appearance and voice preferences.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-medium">
              Appearance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose how VYRON looks on this device.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon

              const isSelected =
                mounted &&
                theme === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTheme(option.value)
                  }
                  disabled={!mounted}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground',
                    !mounted &&
                      'cursor-wait opacity-60'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span className="font-medium">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-medium">
                Voice replies
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Control whether VYRON reads replies aloud.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleVoice}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                voiceEnabled
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}

              {voiceEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="voice-language"
                className="mb-2 flex items-center gap-2 text-sm font-medium"
              >
                <Languages className="h-4 w-4 text-muted-foreground" />
                Voice language
              </label>

              <select
                id="voice-language"
                value={speechLanguage}
                onChange={(event) =>
                  onSpeechLanguageChange(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              >
                {languageOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="voice-speed"
                  className="text-sm font-medium"
                >
                  Speaking speed
                </label>

                <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
                  {speechRate.toFixed(1)}x
                </span>
              </div>

              <input
                id="voice-speed"
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={speechRate}
                onChange={(event) =>
                  onSpeechRateChange(
                    Number(event.target.value)
                  )
                }
                className="w-full accent-primary"
              />

              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}