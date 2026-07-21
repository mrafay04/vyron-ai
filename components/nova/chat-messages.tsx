'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { NovaLogo } from './nova-logo'
import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatMessagesProps = {
  messages: ChatMessage[]
  isTyping: boolean
}

type TypewriterTextProps = {
  content: string
  shouldAnimate: boolean
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-2"
      aria-label="VYRON is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

const markdownComponents: Components = {
  h1({ children }) {
    return (
      <h1 className="mb-3 mt-5 text-2xl font-bold leading-tight first:mt-0">
        {children}
      </h1>
    )
  },

  h2({ children }) {
    return (
      <h2 className="mb-3 mt-5 text-xl font-semibold leading-tight first:mt-0">
        {children}
      </h2>
    )
  },

  h3({ children }) {
    return (
      <h3 className="mb-2 mt-4 text-lg font-semibold leading-tight first:mt-0">
        {children}
      </h3>
    )
  },

  h4({ children }) {
    return (
      <h4 className="mb-2 mt-4 text-base font-semibold leading-tight first:mt-0">
        {children}
      </h4>
    )
  },

  p({ children }) {
    return (
      <p className="mb-3 whitespace-pre-wrap leading-7 last:mb-0">
        {children}
      </p>
    )
  },

  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>
  },

  em({ children }) {
    return <em className="italic">{children}</em>
  },

  ul({ children }) {
    return (
      <ul className="mb-3 ml-5 list-disc space-y-1.5 leading-7 last:mb-0">
        {children}
      </ul>
    )
  },

  ol({ children }) {
    return (
      <ol className="mb-3 ml-5 list-decimal space-y-1.5 leading-7 last:mb-0">
        {children}
      </ol>
    )
  },

  li({ children }) {
    return <li className="pl-1">{children}</li>
  },

  blockquote({ children }) {
    return (
      <blockquote className="my-4 border-l-4 border-primary/50 bg-muted/40 py-2 pl-4 pr-3 italic text-muted-foreground">
        {children}
      </blockquote>
    )
  },

  hr() {
    return <hr className="my-5 border-border" />
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
      >
        {children}
      </a>
    )
  },

  table({ children }) {
    return (
      <div className="my-4 w-full overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    )
  },

  thead({ children }) {
    return <thead className="bg-muted/70">{children}</thead>
  },

  tbody({ children }) {
    return <tbody className="divide-y divide-border">{children}</tbody>
  },

  tr({ children }) {
    return <tr className="divide-x divide-border">{children}</tr>
  },

  th({ children }) {
    return (
      <th className="px-4 py-3 font-semibold text-foreground">
        {children}
      </th>
    )
  },

  td({ children }) {
    return (
      <td className="px-4 py-3 align-top text-muted-foreground">
        {children}
      </td>
    )
  },

  input({ type, checked, disabled }) {
    if (type !== 'checkbox') {
      return <input type={type} disabled={disabled} />
    }

    return (
      <input
        type="checkbox"
        checked={checked}
        disabled
        readOnly
        className="mr-2 translate-y-[1px] accent-primary"
      />
    )
  },

  pre({ children }) {
    return <>{children}</>
  },

  code({ className, children, ...props }) {
    const match = /language-([\w-]+)/.exec(className || '')
    const language = match?.[1]
    const codeContent = String(children).replace(/\n$/, '')
    const isCodeBlock = Boolean(language || codeContent.includes('\n'))

    if (isCodeBlock) {
      return (
        <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {language || 'code'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language={language || 'text'}
              style={vscDarkPlus}
              PreTag="div"
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.8125rem',
                lineHeight: '1.65',
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              }}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        </div>
      )
    }

    return (
      <code
        className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="min-w-0 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypewriterText({
  content,
  shouldAnimate,
}: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState(
    shouldAnimate ? '' : content,
  )

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedContent(content)
      return
    }

    setDisplayedContent('')

    let currentIndex = 0

    const typingInterval = window.setInterval(() => {
      currentIndex += 1
      setDisplayedContent(content.slice(0, currentIndex))

      if (currentIndex >= content.length) {
        window.clearInterval(typingInterval)
      }
    }, 15)

    return () => {
      window.clearInterval(typingInterval)
    }
  }, [content, shouldAnimate])

  const isAnimationComplete =
    displayedContent.length >= content.length

  return (
    <div className="relative">
      <MarkdownContent content={displayedContent} />

      {shouldAnimate && !isAnimationComplete && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export function ChatMessages({
  messages,
  isTyping,
}: ChatMessagesProps) {
  const { data: session } = useSession()
  const bottomRef = useRef<HTMLDivElement>(null)

  const userInitials = session?.user?.name
    ? session.user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join('')
    : 'U'

  const lastAssistantMessageIndex = messages.reduce(
    (lastIndex, message, index) =>
      message.role === 'assistant' ? index : lastIndex,
    -1,
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isTyping])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      {messages.map((message, index) => {
        const isUser = message.role === 'user'

        const shouldAnimate =
          message.role === 'assistant' &&
          index === lastAssistantMessageIndex &&
          !isTyping

        return (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3',
              isUser && 'flex-row-reverse',
            )}
          >
            {isUser ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {userInitials}
              </span>
            ) : (
              <NovaLogo className="h-9 w-9 shrink-0" />
            )}

            <div
              className={cn(
                'min-w-0 max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                isUser
                  ? 'rounded-tr-sm bg-primary text-primary-foreground'
                  : 'rounded-tl-sm border border-border bg-card text-card-foreground',
              )}
            >
              {isUser ? (
                <span className="whitespace-pre-wrap break-words">
                  {message.content}
                </span>
              ) : (
                <TypewriterText
                  content={message.content}
                  shouldAnimate={shouldAnimate}
                />
              )}
            </div>
          </div>
        )
      })}

      {isTyping && (
        <div className="flex items-start gap-3">
          <NovaLogo className="h-9 w-9 shrink-0" />

          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-2 shadow-sm">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}