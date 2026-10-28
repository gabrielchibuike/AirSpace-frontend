import { apiUpload } from "@/lib/api/client"
import type { CrisisResource } from "@/features/checkins/api"
import type { AiStatus, PromptStyle } from "@/features/vent/api"

// ─── Voice vent ──────────────────────────────────────────────────────────────
// POST /api/v1/vent/voice — server-side transcription (ElevenLabs Scribe).
// The audio is processed in memory and never stored. If `reflect` is true the
// transcript is then sent to DeepSeek, so both providers must be disclosed.

export interface VoiceVentResponse {
  transcript: string | null
  reply: string | null
  acknowledgement: string | null
  reflection_prompts: string[] | null
  safety_notice: string | null
  crisis_resources: CrisisResource[] | null
  needs_human_support: boolean
  ai_enabled: boolean
  ai_status: AiStatus
  consent_required: boolean
  stored: boolean
}

export interface VoiceVentOptions {
  consent: boolean
  reflect?: boolean
  promptStyle?: PromptStyle
  /** Optional ISO-639-1 hint, e.g. "en", "ig", "yo", "ha". */
  language?: string
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/flac": "flac",
}

/** The backend validates the file *extension*, so the name must match the blob type. */
export function recordingFileName(blob: Blob): string {
  const base = (blob.type || "audio/webm").split(";")[0]
  return `note.${EXTENSION_BY_TYPE[base] ?? "webm"}`
}

export const voiceApi = {
  transcribe: (blob: Blob, options: VoiceVentOptions) => {
    const form = new FormData()
    form.append("audio", blob, recordingFileName(blob))
    form.append("consent_to_ai_processing", String(options.consent))
    form.append("reflect", String(options.reflect ?? false))
    form.append("prompt_style", options.promptStyle ?? "gentle")
    if (options.language) form.append("language", options.language)
    return apiUpload<VoiceVentResponse>("/vent/voice", form)
  },
}
