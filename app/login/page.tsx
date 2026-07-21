'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ArrowRight, Bot, Loader2, LockKeyhole, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)

      await signIn('google', {
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Google sign-in failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070a0f] px-5 py-10">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <section className="relative z-10 w-full max-w-[460px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-9">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 to-cyan-400 opacity-40 blur-xl" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-2xl">
                <Bot className="h-10 w-10 text-white" strokeWidth={1.8} />
              </div>

              <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#111622]">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Intelligent workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to VYRON
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400 sm:text-base">
              Your intelligent AI assistant for conversations, productivity,
              automation and everyday work.
            </p>
          </div>

          {/* Feature chips */}
          <div className="mb-7 grid grid-cols-3 gap-2">
            <Feature title="AI Powered" />
            <Feature title="Fast" />
            <Feature title="Private" />
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 font-semibold text-slate-900 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}

              <span>
                {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </span>

            {!isLoading && (
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>

          {/* Security text */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5" />
            <span>Secure authentication powered by Google OAuth</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Think. Create. Automate. With VYRON.
        </p>
      </section>
    </main>
  )
}

function Feature({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center text-xs font-medium text-slate-300">
      {title}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39.5 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.2C41.3 35.3 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5Z"
      />
    </svg>
  )
}