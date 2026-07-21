'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useSession } from 'next-auth/react'
import {
  Sidebar,
  type SidebarConversation,
} from '@/components/nova/sidebar'
import { ChatHeader } from '@/components/nova/chat-header'
import { WelcomeSection } from '@/components/nova/welcome-section'
import {
  ChatMessages,
  type ChatMessage,
} from '@/components/nova/chat-messages'
import { MessageInput } from '@/components/nova/message-input'
import { SettingsPanel } from '@/components/nova/settings-panel'

const N8N_CHAT_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_URL!

const N8N_FILE_URL =
  process.env.NEXT_PUBLIC_N8N_FILE_URL!

function cleanTextForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' Code block omitted. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createConversationTitle(
  text: string,
  file?: File | null
) {
  const titleSource =
    text.trim() ||
    (file ? `Analyze ${file.name}` : 'New Chat')

  const cleanedTitle = titleSource
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanedTitle.length <= 55) {
    return cleanedTitle
  }

  return `${cleanedTitle.slice(0, 55).trim()}...`
}

function sortConversations(
  conversations: SidebarConversation[]
) {
  return [...conversations].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime()
  )
}


function getLanguageInstruction(language: string) {
  switch (language) {
    case 'ur-PK':
      return 'Reply completely in natural Urdu using Urdu script. Do not reply in English unless the user specifically asks for English.'

    case 'hi-IN':
      return 'Reply completely in natural Hindi using Devanagari script. Do not reply in English unless the user specifically asks for English.'

    case 'ar-SA':
      return 'Reply completely in clear Arabic. Do not reply in English unless the user specifically asks for English.'

    case 'en-GB':
      return 'Reply completely in clear British English.'

    default:
      return 'Reply completely in simple English.'
  }
}

export default function VyronClient() {
  const [activeMenu, setActiveMenu] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechRate, setSpeechRate] = useState(1)
  const [speechLanguage, setSpeechLanguage] = useState('en-US')
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  const [conversations, setConversations] = useState<
    SidebarConversation[]
  >([])

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null)

  const [
    isLoadingConversation,
    setIsLoadingConversation,
  ] = useState(false)

  const { data: session, status } = useSession()

  const fallbackSessionId =
    session?.user?.email?.toLowerCase() ||
    'anonymous-user'

  const stopSpeaking = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakReply = useCallback(
    (text: string) => {
      if (!voiceEnabled) return

      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        return
      }

      const spokenText = cleanTextForSpeech(text)

      if (!spokenText) return

      stopSpeaking()

      const utterance =
        new SpeechSynthesisUtterance(spokenText)

      utterance.lang = speechLanguage
      utterance.rate = speechRate
      utterance.pitch = 1
      utterance.volume = 1

      window.speechSynthesis.speak(utterance)
    },
    [
      speechLanguage,
      speechRate,
      stopSpeaking,
      voiceEnabled,
    ]
  )

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((currentValue) => {
      const newValue = !currentValue

      if (!newValue) {
        stopSpeaking()
      }

      return newValue
    })
  }, [stopSpeaking])

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(
          `Could not load conversations: ${response.status}`
        )
      }

      const data = await response.json()

      const loadedConversations =
        Array.isArray(data?.conversations)
          ? data.conversations
          : []

      setConversations(
        sortConversations(loadedConversations)
      )
    } catch (error) {
      console.error(
        'Load conversations error:',
        error
      )
    }
  }, [])

  const createConversation = useCallback(
    async (
      title: string,
      conversationMessages: ChatMessage[]
    ) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          messages: conversationMessages,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Could not create conversation: ${response.status}`
        )
      }

      const data = await response.json()
      const conversation = data?.conversation

      if (
        !conversation ||
        typeof conversation.id !== 'string'
      ) {
        throw new Error(
          'Conversation ID was not returned.'
        )
      }

      const savedConversation: SidebarConversation = {
        id: conversation.id,
        title:
          typeof conversation.title === 'string'
            ? conversation.title
            : title,
        updatedAt:
          typeof conversation.updatedAt === 'string'
            ? conversation.updatedAt
            : new Date().toISOString(),
      }

      setConversations((previous) =>
        sortConversations([
          savedConversation,
          ...previous.filter(
            (item) =>
              item.id !== savedConversation.id
          ),
        ])
      )

      setActiveConversationId(conversation.id)

      return conversation.id as string
    },
    []
  )

  const updateConversation = useCallback(
    async (
      conversationId: string,
      conversationMessages: ChatMessage[]
    ) => {
      const response = await fetch(
        `/api/conversations/${conversationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: conversationMessages,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Could not update conversation: ${response.status}`
        )
      }

      const data = await response.json()

      const updatedAt =
        typeof data?.updatedAt === 'string'
          ? data.updatedAt
          : new Date().toISOString()

      setConversations((previous) =>
        sortConversations(
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt,
                }
              : conversation
          )
        )
      )
    },
    []
  )

  const openConversation = useCallback(
    async (conversationId: string) => {
      if (isTyping) return

      stopSpeaking()
      setIsLoadingConversation(true)
      setSidebarOpen(false)
      setActiveMenu('chat')

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Could not open conversation: ${response.status}`
          )
        }

        const data = await response.json()
        const conversation = data?.conversation

        if (!conversation) {
          throw new Error(
            'Conversation data was not returned.'
          )
        }

        const loadedMessages =
          Array.isArray(conversation.messages)
            ? conversation.messages
            : []

        setMessages(loadedMessages)
        setActiveConversationId(conversationId)
        setIsTyping(false)
      } catch (error) {
        console.error(
          'Open conversation error:',
          error
        )
      } finally {
        setIsLoadingConversation(false)
      }
    },
    [isTyping, stopSpeaking]
  )


  const renameConversation = useCallback(
    async (
      conversationId: string,
      newTitle: string
    ) => {
      const trimmedTitle = newTitle.trim()

      if (!trimmedTitle) return

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: trimmedTitle,
            }),
          }
        )

        if (!response.ok) {
          throw new Error(
            `Could not rename conversation: ${response.status}`
          )
        }

        const data = await response.json()

        const updatedAt =
          typeof data?.updatedAt === 'string'
            ? data.updatedAt
            : new Date().toISOString()

        setConversations((previous) =>
          sortConversations(
            previous.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    title: trimmedTitle,
                    updatedAt,
                  }
                : conversation
            )
          )
        )
      } catch (error) {
        console.error(
          'Rename conversation error:',
          error
        )

        window.alert(
          'Chat could not be renamed. Please try again.'
        )
      }
    },
    []
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (isTyping) {
        window.alert(
          'Please wait for the current reply to finish.'
        )
        return
      }

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Could not delete conversation: ${response.status}`
          )
        }

        setConversations((previous) =>
          previous.filter(
            (conversation) =>
              conversation.id !== conversationId
          )
        )

        if (
          activeConversationId === conversationId
        ) {
          stopSpeaking()
          setMessages([])
          setActiveConversationId(null)
          setActiveMenu('chat')
        }

        setSidebarOpen(false)
      } catch (error) {
        console.error(
          'Delete conversation error:',
          error
        )

        window.alert(
          'Chat could not be deleted. Please try again.'
        )
      }
    },
    [
      activeConversationId,
      isTyping,
      stopSpeaking,
    ]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedVoiceEnabled =
      window.localStorage.getItem(
        'vyron-voice-enabled'
      )

    const storedSpeechRate =
      window.localStorage.getItem(
        'vyron-speech-rate'
      )

    const storedSpeechLanguage =
      window.localStorage.getItem(
        'vyron-speech-language'
      )

    if (
      storedVoiceEnabled === 'true' ||
      storedVoiceEnabled === 'false'
    ) {
      setVoiceEnabled(
        storedVoiceEnabled === 'true'
      )
    }

    if (storedSpeechRate) {
      const parsedRate = Number(storedSpeechRate)

      if (
        Number.isFinite(parsedRate) &&
        parsedRate >= 0.7 &&
        parsedRate <= 1.3
      ) {
        setSpeechRate(parsedRate)
      }
    }

    const supportedLanguages = [
      'en-US',
      'en-GB',
      'ur-PK',
      'hi-IN',
      'ar-SA',
    ]

    if (
      storedSpeechLanguage &&
      supportedLanguages.includes(
        storedSpeechLanguage
      )
    ) {
      setSpeechLanguage(
        storedSpeechLanguage
      )
    }

    setPreferencesLoaded(true)
  }, [])

  useEffect(() => {
    if (
      !preferencesLoaded ||
      typeof window === 'undefined'
    ) {
      return
    }

    window.localStorage.setItem(
      'vyron-voice-enabled',
      String(voiceEnabled)
    )

    window.localStorage.setItem(
      'vyron-speech-rate',
      String(speechRate)
    )

    window.localStorage.setItem(
      'vyron-speech-language',
      speechLanguage
    )
  }, [
    preferencesLoaded,
    speechLanguage,
    speechRate,
    voiceEnabled,
  ])

  useEffect(() => {
    if (status === 'authenticated') {
      loadConversations()
      return
    }

    if (status === 'unauthenticated') {
      setConversations([])
      setActiveConversationId(null)
      setMessages([])
    }
  }, [loadConversations, status])

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [stopSpeaking])

  const sendMessage = useCallback(
    async (text: string, file?: File | null) => {
      stopSpeaking()

      const displayText = file
        ? `${text || 'Analyze this file'}\n\n📎 ${file.name}`
        : text

      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: displayText,
      }

      const messagesWithUser = [
        ...messages,
        userMessage,
      ]

      const conversationTitle =
        createConversationTitle(text, file)

      const languageInstruction =
        getLanguageInstruction(speechLanguage)

      const backendText = `${languageInstruction}

User message:
${text || 'Analyze this file'}`

      setMessages(messagesWithUser)
      setIsTyping(true)

      let conversationId =
        activeConversationId

      try {
        if (conversationId) {
          await updateConversation(
            conversationId,
            messagesWithUser
          )
        } else {
          conversationId =
            await createConversation(
              conversationTitle,
              messagesWithUser
            )
        }
      } catch (error) {
        console.error(
          'Initial conversation save error:',
          error
        )
      }

      const n8nSessionId =
        conversationId || fallbackSessionId

      try {
        let response: Response

        if (file) {
          if (!N8N_FILE_URL) {
            throw new Error(
              'N8N file webhook URL is missing.'
            )
          }

          const formData = new FormData()

          formData.append('file', file)

          formData.append(
            'chatInput',
            backendText
          )

          formData.append(
            'sessionId',
            n8nSessionId
          )

          response = await fetch(N8N_FILE_URL, {
            method: 'POST',
            body: formData,
          })
        } else {
          if (!N8N_CHAT_URL) {
            throw new Error(
              'N8N chat webhook URL is missing.'
            )
          }

          response = await fetch(N8N_CHAT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'sendMessage',
              sessionId: n8nSessionId,
              chatInput: backendText,
            }),
          })
        }

        if (!response.ok) {
          throw new Error(
            `VYRON backend error: ${response.status}`
          )
        }

        const data = await response.json()

        const aiReply =
          data?.text ||
          data?.output ||
          data?.response ||
          data?.message ||
          data?.data ||
          'No response received from VYRON.'

        const assistantText =
          typeof aiReply === 'string'
            ? aiReply
            : JSON.stringify(aiReply, null, 2)

        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: assistantText,
        }

        const completedMessages = [
          ...messagesWithUser,
          assistantMessage,
        ]

        setMessages(completedMessages)
        speakReply(assistantText)

        try {
          if (conversationId) {
            await updateConversation(
              conversationId,
              completedMessages
            )
          } else {
            conversationId =
              await createConversation(
                conversationTitle,
                completedMessages
              )
          }
        } catch (saveError) {
          console.error(
            'Final conversation save error:',
            saveError
          )
        }
      } catch (error) {
        console.error(error)

        const errorMessage: ChatMessage = {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content:
            'Sorry, I could not connect to the VYRON backend.',
        }

        const failedMessages = [
          ...messagesWithUser,
          errorMessage,
        ]

        setMessages(failedMessages)

        try {
          if (conversationId) {
            await updateConversation(
              conversationId,
              failedMessages
            )
          } else {
            await createConversation(
              conversationTitle,
              failedMessages
            )
          }
        } catch (saveError) {
          console.error(
            'Failed conversation save error:',
            saveError
          )
        }
      } finally {
        setIsTyping(false)
      }
    },
    [
      activeConversationId,
      createConversation,
      fallbackSessionId,
      messages,
      speakReply,
      speechLanguage,
      stopSpeaking,
      updateConversation,
    ]
  )

  const newChat = useCallback(() => {
    if (isTyping) return

    stopSpeaking()
    setMessages([])
    setActiveConversationId(null)
    setIsTyping(false)
    setActiveMenu('chat')
    setSidebarOpen(false)
  }, [isTyping, stopSpeaking])

  const hasConversation =
    messages.length > 0 || isTyping

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        active={activeMenu}
        onSelect={(id) => {
          if (id === 'settings') {
            stopSpeaking()
          }

          setActiveMenu(id)
          setSidebarOpen(false)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={newChat}
        conversations={conversations}
        activeConversationId={
          activeConversationId
        }
        onSelectConversation={
          openConversation
        }
        onRenameConversation={
          renameConversation
        }
        onDeleteConversation={
          deleteConversation
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
          voiceEnabled={voiceEnabled}
          onToggleVoice={toggleVoice}
        />

        <main className="flex-1 overflow-y-auto">
          {activeMenu === 'settings' ? (
            <SettingsPanel
              voiceEnabled={voiceEnabled}
              onToggleVoice={toggleVoice}
              speechRate={speechRate}
              onSpeechRateChange={setSpeechRate}
              speechLanguage={speechLanguage}
              onSpeechLanguageChange={
                setSpeechLanguage
              }
            />
          ) : isLoadingConversation ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Loading conversation...
              </p>
            </div>
          ) : hasConversation ? (
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
            />
          ) : (
            <WelcomeSection
              onAction={(text) =>
                sendMessage(text, null)
              }
            />
          )}
        </main>

        {activeMenu !== 'settings' && (
          <MessageInput
            onSend={sendMessage}
            disabled={
              isTyping ||
              isLoadingConversation
            }
          />
        )}
      </div>
    </div>
  )
}
