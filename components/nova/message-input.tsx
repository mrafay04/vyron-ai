'use client'

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ArrowUp, Mic, Paperclip } from 'lucide-react'

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  length: number
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionResultListLike {
  length: number
  [index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string

  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null

  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (text: string, file?: File | null) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [speechError, setSpeechError] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const speechBaseValueRef = useRef('')

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow

    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setIsSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setSpeechError('')
    }

    recognition.onresult = (event) => {
      let transcript = ''

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? ''
      }

      const existingText = speechBaseValueRef.current
      const spokenText = transcript.trim()

      setValue(
        existingText
          ? `${existingText} ${spokenText}`.trim()
          : spokenText
      )
    }

    recognition.onerror = (event) => {
      setIsListening(false)

      if (event.error === 'aborted') {
        return
      }

      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        setSpeechError(
          'Microphone permission was denied. Please allow microphone access.'
        )
        return
      }

      if (event.error === 'audio-capture') {
        setSpeechError('No microphone was detected.')
        return
      }

      if (event.error === 'no-speech') {
        setSpeechError('No speech was detected. Please try again.')
        return
      }

      setSpeechError('Voice input failed. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()

      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [value])

  const submit = () => {
    const trimmed = value.trim()

    if ((!trimmed && !selectedFile) || disabled) return

    recognitionRef.current?.abort()
    setIsListening(false)

    onSend(
      trimmed || `Analyze this file: ${selectedFile?.name}`,
      selectedFile
    )

    setValue('')
    setSelectedFile(null)
    setSpeechError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
  }

  const handleMicrophoneClick = () => {
    if (disabled) return

    const recognition = recognitionRef.current

    if (!recognition) {
      setSpeechError(
        'Voice input is not supported in this browser. Please use Chrome or Edge.'
      )
      return
    }

    if (isListening) {
      recognition.stop()
      return
    }

    setSpeechError('')
    speechBaseValueRef.current = value.trim()

    try {
      recognition.start()
    } catch {
      setSpeechError('Microphone is already active. Please try again.')
    }
  }

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl px-4 py-4"
      >
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <span className="truncate text-foreground">
              {selectedFile.name}
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null)

                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="ml-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg transition-colors focus-within:border-primary/40">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Attach an Excel, CSV, PDF, or image file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              isListening
                ? 'Listening...'
                : 'Message VYRON…'
            }
            className="max-h-40 flex-1 resize-none bg-transparent py-2 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="button"
            onClick={handleMicrophoneClick}
            disabled={disabled || !isSpeechSupported}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening
                ? 'animate-pulse bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            aria-label={
              isListening
                ? 'Stop microphone'
                : 'Use microphone'
            }
            aria-pressed={isListening}
            title={
              isListening
                ? 'Stop listening'
                : 'Start voice input'
            }
          >
            <Mic className="h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={(!value.trim() && !selectedFile) || disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>

        {isListening && (
          <p className="mt-2 text-center text-xs text-primary">
            Listening... speak now
          </p>
        )}

        {speechError && (
          <p className="mt-2 text-center text-xs text-red-500">
            {speechError}
          </p>
        )}

        <p className="mt-2 text-center text-xs text-muted-foreground">
          VYRON can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  )
}