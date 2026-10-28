import { useMemo, useRef, useState } from "react"
import { LuSend, LuSparkles, LuTriangleAlert, LuTrash2 } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PromptStyleSelect } from "@/components/PromptStyleSelect"
import { SafetyNotice } from "@/components/SafetyNotice"
import {
  CHAT_MAX_MESSAGE_CHARS,
  CHAT_MAX_MESSAGES,
  CHAT_MAX_TOTAL_CHARS,
  type ChatMessage,
} from "@/features/chat/api"
import { useChatTurn } from "@/features/chat/hooks"
import type { CrisisResource } from "@/features/checkins/api"
import type { PromptStyle } from "@/features/vent/api"
import { ApiError, getErrorMessage } from "@/lib/api/errors"

interface SafetyState {
  notice: string
  resources: CrisisResource[] | null
}

/** Keep the conversation inside the server's limits without dropping the newest turn. */
function fitToLimits(messages: ChatMessage[]): ChatMessage[] {
  let list = messages.slice(-CHAT_MAX_MESSAGES).map((m) => ({
    role: m.role,
    content: m.content.slice(0, CHAT_MAX_MESSAGE_CHARS),
  }))
  while (list.length > 1 && list.reduce((sum, m) => sum + m.content.length, 0) > CHAT_MAX_TOTAL_CHARS) {
    list = list.slice(1)
  }
  return list
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [style, setStyle] = useState<PromptStyle>("gentle")
  const [consent, setConsent] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [safety, setSafety] = useState<SafetyState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const chat = useChatTurn()
  const listEnd = useRef<HTMLDivElement | null>(null)

  const totalChars = useMemo(
    () => messages.reduce((sum, m) => sum + m.content.length, 0),
    [messages],
  )

  function send(list: ChatMessage[], consentFlag: boolean) {
    setError(null)
    setNote(null)
    chat.mutate(
      { messages: list, prompt_style: style, consent_to_ai_processing: consentFlag },
      {
        onSuccess: (result) => {
          if (result.safety_notice) {
            setSafety({ notice: result.safety_notice, resources: result.crisis_resources })
            setMessages([])
            setNeedsConsent(false)
            return
          }
          if (result.ai_status === "consent_required" || result.consent_required) {
            setNeedsConsent(true)
            return
          }
          setNeedsConsent(false)
          if (result.reply) {
            setMessages([...list, { role: "assistant", content: result.reply }])
            if (result.ai_status === "unavailable") {
              setNote("AI replies are switched off on this server, so that is a static prompt. Nothing you write here is stored.")
            } else if (result.ai_status === "fallback") {
              setNote("The AI provider didn't answer, so that is a basic prompt instead.")
            }
          } else {
            setError("We didn't get a reply back. Try sending that again.")
          }
        },
        onError: (e) => {
          setError(getErrorMessage(e))
          if (e instanceof ApiError && e.status === 429) setNote(null)
        },
      },
    )
  }

  function handleSubmit() {
    const text = input.trim()
    if (!text || chat.isPending) return
    const withUser = fitToLimits([...messages, { role: "user", content: text }])
    setMessages(withUser)
    setInput("")
    send(withUser, consent)
    window.setTimeout(() => listEnd.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  function acceptConsent() {
    setConsent(true)
    send(messages, true)
  }

  function reset() {
    setMessages([])
    setInput("")
    setConsent(false)
    setNeedsConsent(false)
    setSafety(null)
    setError(null)
    setNote(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <LuSparkles className="h-3.5 w-3.5" aria-hidden />
            AI chat · stateless
          </p>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Talk it through</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A short back-and-forth with an AI companion. This is not therapy, and nothing is saved
            on the server — closing this page ends the conversation.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={reset}>
            <LuTrash2 className="h-4 w-4" aria-hidden />
            Clear
          </Button>
        )}
      </div>

      {safety && <SafetyNotice notice={safety.notice} resources={safety.resources} />}

      <PromptStyleSelect value={style} onChange={setStyle} disabled={chat.isPending} />

      {messages.length === 0 && !safety && (
        <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Start with whatever is loudest in your head right now.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <ul className="space-y-3" aria-live="polite">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary/10 px-4 py-3 text-sm text-foreground"
                  : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border bg-card px-4 py-3 text-sm text-foreground"
              }
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {message.role === "user" ? "You" : "AirSpace · AI, not a therapist"}
              </p>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            </li>
          ))}
        </ul>
      )}
      <div ref={listEnd} />

      {chat.isPending && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Thinking it over…
        </p>
      )}

      {needsConsent && (
        <div className="rounded-xl border bg-secondary/40 px-4 py-3 text-sm">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I consent to this conversation being sent to{" "}
              <strong className="text-foreground">DeepSeek</strong>, an external AI provider, to
              generate a reply.{" "}
              <span className="text-muted-foreground">
                AirSpace doesn&apos;t store it; DeepSeek handles it under its own terms and privacy policy.
              </span>
            </span>
          </label>
          <Button
            size="sm"
            className="mt-3 gap-1.5"
            disabled={!consent || chat.isPending}
            onClick={acceptConsent}
          >
            <LuSparkles className="h-3.5 w-3.5" aria-hidden />
            {chat.isPending ? "Sending…" : "Send with consent"}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      <div className="rounded-2xl border bg-card shadow-sm">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, CHAT_MAX_MESSAGE_CHARS))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          rows={2}
          maxLength={CHAT_MAX_MESSAGE_CHARS}
          placeholder="Type a message…"
          aria-label="Your message"
          className="min-h-20 resize-y border-0 bg-transparent p-4 text-base shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>
            {totalChars.toLocaleString()} / {CHAT_MAX_TOTAL_CHARS.toLocaleString()} characters in
            this conversation
          </span>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={!input.trim() || chat.isPending}>
            <LuSend className="h-3.5 w-3.5" aria-hidden />
            {chat.isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

    </div>
  )
}
