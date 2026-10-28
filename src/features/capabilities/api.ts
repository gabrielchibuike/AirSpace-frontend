import { api } from "@/lib/api/client"

export interface CapabilitiesResponse {
  ai_enabled: boolean
  text_ai_provider: string | null
  transcription_enabled: boolean
  transcription_provider: string | null
  max_vent_chars: number
  max_reframe_chars: number
  max_audio_bytes: number
  chat_max_messages: number
  chat_max_message_chars: number
  chat_max_total_chars: number
  checkins_page_size: number
  checkin_note_max_chars: number
}

export const capabilitiesApi = {
  get: () =>
    api<CapabilitiesResponse>("/capabilities", {
      signal: AbortSignal.timeout(10_000),
    }),
}