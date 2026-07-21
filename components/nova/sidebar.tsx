'use client'

import { useState } from 'react'
import {
  Calendar,
  Globe,
  LogOut,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Sheet,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { NovaLogo } from './nova-logo'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    enabled: true,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    icon: Mail,
    enabled: false,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    enabled: false,
  },
  {
    id: 'sheets',
    label: 'Google Sheets',
    icon: Sheet,
    enabled: false,
  },
  {
    id: 'search',
    label: 'Web Search',
    icon: Globe,
    enabled: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    enabled: true,
  },
]

export type SidebarConversation = {
  id: string
  title: string
  updatedAt: string
}

type SidebarProps = {
  active: string
  onSelect: (id: string) => void
  open: boolean
  onClose: () => void
  onNewChat: () => void
  conversations?: SidebarConversation[]
  activeConversationId?: string | null
  onSelectConversation?: (conversationId: string) => void
  onRenameConversation?: (
    conversationId: string,
    newTitle: string
  ) => void
  onDeleteConversation?: (conversationId: string) => void
}

type ConversationGroup =
  | 'Today'
  | 'Yesterday'
  | 'Last Week'
  | 'Older'

const groupOrder: ConversationGroup[] = [
  'Today',
  'Yesterday',
  'Last Week',
  'Older',
]

function getConversationGroup(
  updatedAt: string
): ConversationGroup {
  const conversationDate = new Date(updatedAt)

  if (Number.isNaN(conversationDate.getTime())) {
    return 'Older'
  }

  const now = new Date()

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const startOfLastWeek = new Date(startOfToday)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  if (conversationDate >= startOfToday) {
    return 'Today'
  }

  if (conversationDate >= startOfYesterday) {
    return 'Yesterday'
  }

  if (conversationDate >= startOfLastWeek) {
    return 'Last Week'
  }

  return 'Older'
}

export function Sidebar({
  active,
  onSelect,
  open,
  onClose,
  onNewChat,
  conversations = [],
  activeConversationId = null,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}: SidebarProps) {
  const { data: session, status } = useSession()

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null)

  const user = session?.user
  const userName = user?.name || 'VYRON User'
  const userEmail = user?.email || 'Signed in'
  const userImage = user?.image

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('')

  const sortedConversations = [...conversations].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime()
  )

  const groupedConversations = groupOrder.map((group) => ({
    group,
    conversations: sortedConversations.filter(
      (conversation) =>
        getConversationGroup(conversation.updatedAt) === group
    ),
  }))

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/',
    })
  }

  const handleRename = (conversation: SidebarConversation) => {
    setOpenMenuId(null)

    const newTitle = window.prompt(
      'Enter a new chat title:',
      conversation.title
    )

    const trimmedTitle = newTitle?.trim()

    if (
      !trimmedTitle ||
      trimmedTitle === conversation.title
    ) {
      return
    }

    onRenameConversation?.(
      conversation.id,
      trimmedTitle
    )
  }

  const handleDelete = (conversation: SidebarConversation) => {
    setOpenMenuId(null)

    const confirmed = window.confirm(
      `Delete "${conversation.title}"?\n\nThis cannot be undone.`
    )

    if (!confirmed) return

    onDeleteConversation?.(conversation.id)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <NovaLogo className="h-10 w-10" />

            <div className="leading-tight">
              <p className="text-base font-semibold tracking-tight">
                VYRON
              </p>

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                AI Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null)
              onNewChat()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <nav className="mt-6 px-3">
          <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Menu
          </p>

          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!item.enabled}
                    onClick={() => {
                      if (!item.enabled) return

                      setOpenMenuId(null)
                      onSelect(item.id)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      !item.enabled
                        ? 'cursor-not-allowed text-muted-foreground/40'
                        : isActive
                          ? 'bg-sidebar-accent text-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                    )}
                    title={
                      item.enabled
                        ? item.label
                        : `${item.label} coming soon`
                    }
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px]',
                        item.enabled &&
                          isActive &&
                          'text-primary'
                      )}
                    />

                    <span className="min-w-0 flex-1 text-left">
                      {item.label}
                    </span>

                    {!item.enabled && (
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-6 flex-1 overflow-y-auto px-3">
          {conversations.length === 0 ? (
            <>
              <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Recent
              </p>

              <p className="px-3 py-3 text-xs text-muted-foreground">
                No saved conversations yet.
              </p>
            </>
          ) : (
            groupedConversations.map(
              ({ group, conversations: groupConversations }) => {
                if (groupConversations.length === 0) {
                  return null
                }

                return (
                  <div key={group} className="mb-5">
                    <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {group}
                    </p>

                    <ul className="flex flex-col gap-0.5">
                      {groupConversations.map(
                        (conversation) => {
                          const isActiveConversation =
                            activeConversationId ===
                            conversation.id

                          const isMenuOpen =
                            openMenuId === conversation.id

                          return (
                            <li
                              key={conversation.id}
                              className="relative"
                            >
                              <div
                                className={cn(
                                  'group flex items-center rounded-lg transition-colors',
                                  isActiveConversation
                                    ? 'bg-sidebar-accent text-foreground'
                                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    onSelectConversation?.(
                                      conversation.id
                                    )
                                  }}
                                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left text-sm"
                                >
                                  <MessageSquare
                                    className={cn(
                                      'h-4 w-4 shrink-0',
                                      isActiveConversation
                                        ? 'text-primary'
                                        : 'opacity-60'
                                    )}
                                  />

                                  <span className="truncate">
                                    {conversation.title}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()

                                    setOpenMenuId((currentId) =>
                                      currentId === conversation.id
                                        ? null
                                        : conversation.id
                                    )
                                  }}
                                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-background/60 group-hover:opacity-100 focus:opacity-100"
                                  aria-label={`Options for ${conversation.title}`}
                                  title="Chat options"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>

                              {isMenuOpen && (
                                <div className="absolute right-1 top-9 z-50 w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRename(conversation)
                                    }
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-secondary"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Rename
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(conversation)
                                    }
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </li>
                          )
                        }
                      )}
                    </ul>
                  </div>
                )
              }
            )
          )}
        </div>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl bg-sidebar-accent/30 p-2">
            <div className="flex items-center gap-3">
              {status === 'loading' ? (
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-secondary" />
              ) : userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                  {initials || (
                    <User className="h-5 w-5" />
                  )}
                </span>
              )}

              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">
                  {status === 'loading'
                    ? 'Loading...'
                    : userName}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {status === 'loading'
                    ? 'Please wait'
                    : userEmail}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={status === 'loading'}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}