import { api } from "@/lib/api/client"
import type { CrisisResource } from "@/features/checkins/api"

// ─── Vent ─────────────────────────────────────────────────────────────────────
// Vent text is NEVER stored server-side. Do not cache or log it in the app.

export interface VentRequest {
  text: string
}

export interface VentResponse {
  acknowledgement: string
  reflection_prompts: string[]
  safety_notice: string | null
  crisis_resources: CrisisResource[] | null
  stored: boolean
}

// ─── Reframe ──────────────────────────────────────────────────────────────────
// Reflection may use a generic fallback OR consented AI processing.
// Only request AI processing if the user has explicitly consented.

export type PromptStyle = "gentle" | "practical" | "reflective"
export type AiStatus = "skipped_for_safety" | "unavailable" | "consent_required" | "success" | "fallback"

export interface ReframeRequest {
  text: string
  prompt_style?: PromptStyle
  consent_to_ai_processing?: boolean
}

export interface ReframeResponse {
  reflection: string | null
  safety_notice: string | null
  crisis_resources: CrisisResource[] | null
  needs_human_support: boolean
  ai_enabled: boolean
  ai_status: AiStatus
  consent_required: boolean
}

// ─── Crisis Resources ─────────────────────────────────────────────────────────

export const ventApi = {
  /**
   * Submit a vent. Text is processed server-side but never stored.
   * Do NOT log, cache, or persist the request text in this app.
   */
  vent: (body: VentRequest) =>
    api<VentResponse>("/vent", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(30_000),
    }),

  /**
   * Request a reflection/reframe. May return a generic fallback or AI response
   * depending on server config and user consent.
   */
  reframe: (body: ReframeRequest) =>
    api<ReframeResponse>("/reframe", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(30_000),
    }),

  /** List static crisis resources (no auth required). */
  crisisResources: () => api<CrisisResource[]>("/crisis-resources"),
}
