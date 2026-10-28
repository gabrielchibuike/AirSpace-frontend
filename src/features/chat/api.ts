import { api } from "@/lib/api/client"
import type { CrisisResource } from "@/features/checkins/api"
import type { AiStatus, PromptStyle } from "@/features/vent/api"

// ─── Chat ────────────────────────────────────────────────────────────────────
// POST /api/v1/chat is stateless: the client holds the conversation and resends
// it each turn. The server stores nothing, so nothing here is cached or logged.

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  prompt_style: PromptStyle
  consent_to_ai_processing: boolean
}

export interface ChatResponse {
  reply: string | null
  safety_notice: string | null
  crisis_resources: CrisisResource[] | null
  needs_human_support: boolean
  ai_enabled: boolean
  ai_status: AiStatus
  consent_required: boolean
}

// Server limits (AIRSPACE_API_CONTRACT.md): 1–20 messages, 4,000 chars each,
// 12,000 chars total, and the last message must be from the user.
export const CHAT_MAX_MESSAGES = 20
export const CHAT_MAX_MESSAGE_CHARS = 4000
export const CHAT_MAX_TOTAL_CHARS = 12_000

export const chatApi = {
  send: (body: ChatRequest) =>
    api<ChatResponse>("/chat", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(45_000),
    }),
}
