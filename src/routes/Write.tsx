import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuArrowRight, LuSparkles, LuTriangleAlert } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PromptStyleSelect } from "@/components/PromptStyleSelect"
import { SafetyNotice } from "@/components/SafetyNotice"
import { MoodScale, moodIcon, moodLabel } from "@/features/checkins/MoodScale"
import { useCreateCheckIn, useUpdateCheckIn } from "@/features/checkins"
import { useVent, useReframe } from "@/features/vent/hooks"
import { VoiceRecorder } from "@/features/voice/VoiceRecorder"
import { getErrorMessage } from "@/lib/api/errors"
import type { CrisisResource } from "@/features/checkins/api"
import type { CheckInResponse } from "@/features/checkins/api"
import type { PromptStyle, ReframeResponse, VentResponse } from "@/features/vent/api"

// Limits from the backend schemas (app/schemas.py).
const VENT_MAX = 12_000 // POST /vent
const REFRAME_MAX = 6_000 // POST /reframe
const NOTE_MAX = 500 // check-in note, stored server-side
const EMOTION_MAX = 80

type Step = "before" | "write" | "reflect" | "after"

export default function WritePage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("before")
  const [beforeScore, setBeforeScore] = useState<number | null>(null)
  const [ventText, setVentText] = useState("")
  const [emotion, setEmotion] = useState("")
  const [noteSaved, setNoteSaved] = useState<number | null>(null)
  const [checkin, setCheckin] = useState<CheckInResponse | null>(null)
  const [ventResult, setVentResult] = useState<VentResponse | null>(null)
  const [reframeResult, setReframeResult] = useState<ReframeResponse | null>(null)
  const [afterScore, setAfterScore] = useState<number | null>(null)
  const [consentToAI, setConsentToAI] = useState(false)
  const [style, setStyle] = useState<PromptStyle>("gentle")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [safetyFromVoice, setSafetyFromVoice] = useState<{
    notice: string
    resources: CrisisResource[] | null
  } | null>(null)

  const createCheckIn = useCreateCheckIn()
  const updateCheckIn = useUpdateCheckIn()
  const vent = useVent()
  const reframe = useReframe()

  // ── Step 1 → 2: the check-in is what makes this entry persist ─────────────
  async function handleContinueToWrite() {
    if (beforeScore === null) return
    setSubmitError(null)
    try {
      const created = await createCheckIn.mutateAsync({ before_score: beforeScore })
      setCheckin(created)
      if (created.safety_notice) {
        setSafetyFromVoice({ notice: created.safety_notice, resources: created.crisis_resources })
      }
    } catch (e) {
      // Without a check-in there is nothing to save the entry against.
      setSubmitError(getErrorMessage(e))
      return
    }
    setStep("write")
  }

  // ── Step 2 → 3: static vent response, then save the note ─────────────────
  async function handleVent() {
    const text = ventText.trim()
    if (text.length === 0) return
    setSubmitError(null)
    try {
      const result = await vent.mutateAsync({ text })
      setVentResult(result)
      if (result.safety_notice) {
        setSafetyFromVoice({ notice: result.safety_notice, resources: result.crisis_resources })
      }

      // The note is the only part of the writing that is stored, so say so and
      // save exactly what will be shown back to the user later.
      if (checkin) {
        const note = text.slice(0, NOTE_MAX)
        const saved = await updateCheckIn.mutateAsync({
          id: checkin.id,
          body: { note, emotion: emotion.trim().slice(0, EMOTION_MAX) || null },
        })
        setCheckin(saved)
        setNoteSaved(note.length)
        if (saved.safety_notice) {
          setSafetyFromVoice({ notice: saved.safety_notice, resources: saved.crisis_resources })
        }
      }
      setStep("reflect")
    } catch (e) {
      setSubmitError(getErrorMessage(e))
    }
  }

  // ── Step 3: request a reframe (AI only after explicit consent) ────────────
  async function handleReframe(withConsent = false) {
    const text = ventText.trim().slice(0, REFRAME_MAX)
    if (text.length === 0) return
    setSubmitError(null)
    try {
      const result = await reframe.mutateAsync({
        text,
        prompt_style: style,
        consent_to_ai_processing: withConsent,
      })
      setReframeResult(result)
    } catch (e) {
      setSubmitError(getErrorMessage(e))
    }
  }

  async function handleFinish() {
    setSubmitError(null)
    if (afterScore !== null && checkin) {
      try {
        await updateCheckIn.mutateAsync({ id: checkin.id, body: { after_score: afterScore } })
      } catch (e) {
        setSubmitError(getErrorMessage(e))
        return
      }
    }
    navigate(checkin ? `/entries/${checkin.id}` : "/entries", { replace: true })
  }

  const safetyNotice =
    safetyFromVoice?.notice ?? ventResult?.safety_notice ?? reframeResult?.safety_notice ?? null
  const safetyResources =
    safetyFromVoice?.resources ??
    ventResult?.crisis_resources ??
    reframeResult?.crisis_resources ??
    null

  // ════════════════════════════════════════════════════════════════
  // STEP 1 — Starting check-in
  // ════════════════════════════════════════════════════════════════
  if (step === "before") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Step 1 of 3 · Before we begin
          </p>
          <h1 className="text-3xl font-light tracking-wide text-foreground sm:text-4xl">
            How are you feeling right now?
          </h1>
          <p className="mt-3 text-muted-foreground">
            This check-in is what saves the entry to your account. Rate it from 1 to 10, where 1 is
            very heavy and 10 is calm.
          </p>
        </div>

        <MoodScale
          name="before"
          legend="How are you feeling right now?"
          value={beforeScore}
          onChange={setBeforeScore}
        />

        {submitError && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="w-full max-w-xs gap-2"
            disabled={beforeScore === null || createCheckIn.isPending}
            onClick={handleContinueToWrite}
          >
            {createCheckIn.isPending ? "One moment…" : "Continue to writing space"}
            <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your score and note are stored in your account so you can look back at them.
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 2 — Writing space
  // ════════════════════════════════════════════════════════════════
  if (step === "write") {
    const charCount = ventText.length
    const wordCount = ventText.trim() === "" ? 0 : ventText.trim().split(/\s+/).length
    const noteLength = Math.min(charCount, NOTE_MAX)
    const canSubmit = ventText.trim().length > 0 && !vent.isPending

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Step 2 of 3 · Air it out
          </p>
          {beforeScore !== null && (
            <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              Feeling: {moodLabel(beforeScore)} ({beforeScore}/10)
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-light tracking-wide text-foreground">
            Let the thoughts breathe.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Release whatever feels heavy or unsettled. Unfiltered and unjudged.
          </p>
        </div>

        <VoiceRecorder
          onTranscript={(text) => setVentText((current) => (current ? `${current}\n${text}` : text))}
          onSafety={(notice, resources) => setSafetyFromVoice({ notice, resources })}
          disabled={vent.isPending}
        />

        {safetyFromVoice && (
          <SafetyNotice notice={safetyFromVoice.notice} resources={safetyFromVoice.resources} />
        )}

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-8 rounded-full bg-primary" aria-hidden />
              Your words
            </p>
            <p className="text-xs text-muted-foreground">
              {noteLength > 0 ? `${noteLength}/${NOTE_MAX} saved as note` : "Not saved yet"}
            </p>
          </div>
          <Textarea
            id="vent-entry"
            value={ventText}
            maxLength={VENT_MAX}
            autoComplete="off"
            spellCheck
            placeholder="Write whatever's on your mind."
            className="min-h-72 resize-y border-0 bg-transparent p-5 text-base leading-relaxed shadow-none focus-visible:ring-0"
            onChange={(e) => setVentText(e.target.value)}
            aria-label="Your words"
          />
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>Only the first {NOTE_MAX} characters are kept as the entry note.</span>
            <span>
              {wordCount} word{wordCount !== 1 ? "s" : ""} · {charCount.toLocaleString()} characters
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="emotion" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            One word for how this feels (optional)
          </label>
          <input
            id="emotion"
            value={emotion}
            maxLength={EMOTION_MAX}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="e.g. exhausted, relieved, angry"
            className="h-10 rounded-lg border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="rounded-xl border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
          Your note and score are stored in your account. The full text is sent to the server for a
          reflection and is not stored there — but it is also not end-to-end encrypted.
        </p>

        {submitError && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button size="lg" className="gap-2" disabled={!canSubmit} onClick={handleVent}>
            {vent.isPending ? "Saving…" : "Save & reflect"}
            <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Room to pause. When you save, we&apos;ll offer a reflection and a closing check-in.
        </p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 3 — Reflection
  // ════════════════════════════════════════════════════════════════
  if (step === "reflect") {
    const consentRequired = reframeResult?.ai_status === "consent_required"
    const reflection = reframeResult?.reflection ?? null
    // "unavailable" still carries the static generic prompt, so show it rather than
    // leaving the screen with a dead button and no output.
    const showReflection =
      reflection !== null &&
      (reframeResult?.ai_status === "success" ||
        reframeResult?.ai_status === "fallback" ||
        reframeResult?.ai_status === "unavailable")

    // Per the contract, a safety notice takes over the screen.
    if (safetyNotice) {
      return (
        <div className="mx-auto max-w-2xl space-y-6">
          <SafetyNotice notice={safetyNotice} resources={safetyResources} />
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg" onClick={() => navigate("/entries", { replace: true })}>
              Go to my entries
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setStep("after")}>
              Record how I feel now
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Step 3 of 3 · Decompress &amp; reflect
          </p>
          {beforeScore !== null && (
            <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              Started at {moodLabel(beforeScore)} ({beforeScore}/10)
            </span>
          )}
        </div>

        {ventResult && (
          <div className="rounded-2xl border-l-4 border-primary bg-card p-5 shadow-sm">
            <p className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span>A note back</span>
              {noteSaved !== null && <span className="normal-case">Note saved · {noteSaved} characters</span>}
            </p>
            <p className="text-base italic leading-relaxed text-muted-foreground">
              {ventResult.acknowledgement}
            </p>
          </div>
        )}

        {ventResult && ventResult.reflection_prompts.length > 0 && !showReflection && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              A few things to sit with
            </p>
            <ul className="space-y-2">
              {ventResult.reflection_prompts.map((prompt, index) => (
                <li key={index} className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        <PromptStyleSelect value={style} onChange={setStyle} disabled={reframe.isPending} />

        {showReflection && (
          <div className="rounded-2xl border bg-ai p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-ai-border bg-card/50 px-3 py-1 text-xs font-medium text-ai-foreground">
                <LuSparkles className="h-3 w-3" aria-hidden />
                {reframeResult?.ai_status === "success" ? "AI reflection" : "Basic prompt"}
                {reframeResult?.ai_status === "success" && " · DeepSeek"} · Not advice or a diagnosis
              </span>
              <span className="text-xs text-muted-foreground">Not stored — read it now</span>
            </div>
            <p className="whitespace-pre-wrap break-words leading-relaxed text-ai-foreground">
              {reflection}
            </p>
          </div>
        )}

        {/* Consent is shown whenever the API says it needs opt-in, even with no reflection. */}
        {consentRequired && (
          <div className="rounded-xl border bg-secondary/40 px-4 py-3 text-sm">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={consentToAI}
                onChange={(e) => setConsentToAI(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I consent to my text being sent to <strong className="text-foreground">DeepSeek</strong>, an
                external AI provider, to generate a more personalised reflection.{" "}
                <span className="text-muted-foreground">
                  AirSpace does not store your words. DeepSeek handles the text under its own terms
                  and privacy policy.
                </span>
              </span>
            </label>
            <Button
              size="sm"
              className="mt-3 gap-1.5"
              disabled={!consentToAI || reframe.isPending}
              onClick={() => handleReframe(true)}
            >
              <LuSparkles className="h-3.5 w-3.5" aria-hidden />
              {reframe.isPending ? "Reflecting…" : "Send with consent"}
            </Button>
          </div>
        )}

        {!showReflection && !consentRequired && (
          <Button
            variant="secondary"
            className="gap-2"
            disabled={reframe.isPending}
            onClick={() => handleReframe(consentToAI)}
          >
            <LuSparkles className="h-4 w-4" aria-hidden />
            {reframe.isPending
              ? "Taking a thoughtful look…"
              : reframe.isError
                ? "Try the reflection again"
                : "Get a gentle reflection"}
          </Button>
        )}

        {ventText.trim().length > REFRAME_MAX && (
          <p className="text-xs text-muted-foreground">
            Only the first {REFRAME_MAX.toLocaleString()} characters are used for the AI reflection.
            Your saved note is the first {NOTE_MAX}.
          </p>
        )}

        {submitError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button size="lg" className="gap-2" onClick={() => setStep("after")}>
            Closing check-in
            <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate(checkin ? `/entries/${checkin.id}` : "/entries")}>
            View this entry
          </Button>
        </div>

      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 4 — Closing check-in
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          Closing check-in
        </p>
        <h1 className="text-3xl font-light tracking-wide text-foreground sm:text-4xl">
          How are you feeling now?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Take a breath and notice what shifted, even subtly. No right or wrong answers.
        </p>
      </div>

      <MoodScale
        name="after"
        legend="How are you feeling now?"
        value={afterScore}
        onChange={setAfterScore}
      />

      {beforeScore !== null && afterScore !== null && (
        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-around gap-4 text-sm">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <p className="text-xs uppercase tracking-widest">Before</p>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-input bg-muted text-lg">
                {moodIcon(beforeScore)}
              </div>
              <p className="font-medium">
                {moodLabel(beforeScore)} ({beforeScore}/10)
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <LuArrowRight className="h-5 w-5" aria-hidden />
              <p>decompress</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Now</p>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-lg">
                {moodIcon(afterScore)}
              </div>
              <p className="font-medium text-primary">
                {moodLabel(afterScore)} ({afterScore}/10)
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-foreground">
            You started at <strong>{beforeScore}/10</strong> and ended at{" "}
            <strong className="text-primary">{afterScore}/10</strong>.{" "}
            {afterScore >= beforeScore
              ? "Giving your thoughts a quiet place to land created a little breathing room."
              : "It takes courage to be honest about where you are. That matters."}
          </div>
        </div>
      )}

      {submitError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          className="gap-2"
          disabled={afterScore === null || updateCheckIn.isPending}
          onClick={handleFinish}
        >
          {updateCheckIn.isPending ? "Saving…" : "Save and finish"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(checkin ? `/entries/${checkin.id}` : "/entries", { replace: true })}
        >
          Skip the closing score
        </Button>
      </div>

    </div>
  )
}
