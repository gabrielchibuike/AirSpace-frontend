import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuArrowRight, LuLock, LuSparkles, LuTriangleAlert } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MoodScale } from "@/features/checkins/MoodScale"
import { useCreateCheckIn, useUpdateCheckIn } from "@/features/checkins"
import { useVent, useReframe } from "@/features/vent/hooks"
import { getErrorMessage } from "@/lib/api/errors"
import { CrisisDialog } from "@/components/CrisisDialog"
import type { VentResponse } from "@/features/vent/api"
import type { ReframeResponse } from "@/features/vent/api"
import type { CheckInResponse } from "@/features/checkins/api"
import { moodLabel } from "@/features/checkins/MoodScale"

// Vent text limit from OpenAPI schema
const VENT_MAX = 12_000

type Step = "before" | "write" | "reflect" | "after"

export default function WritePage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("before")
  const [beforeScore, setBeforeScore] = useState<number | null>(null)
  const [ventText, setVentText] = useState("")
  const [checkin, setCheckin] = useState<CheckInResponse | null>(null)
  const [ventResult, setVentResult] = useState<VentResponse | null>(null)
  const [reframeResult, setReframeResult] = useState<ReframeResponse | null>(null)
  const [afterScore, setAfterScore] = useState<number | null>(null)
  const [consentToAI, setConsentToAI] = useState(false)

  const createCheckIn = useCreateCheckIn()
  const updateCheckIn = useUpdateCheckIn()
  const vent = useVent()
  const reframe = useReframe()

  // ── Step 1 → 2: Save before-score check-in and move to writing ──
  async function handleContinueToWrite() {
    if (beforeScore === null) return
    try {
      const created = await createCheckIn.mutateAsync({ before_score: beforeScore })
      setCheckin(created)
    } catch {
      // Non-fatal: we can still write without a check-in
    }
    setStep("write")
  }

  function handleSkipToWrite() {
    setStep("write")
  }

  // ── Step 2 → 3: Submit vent text and get acknowledgement ────────
  async function handleVent() {
    if (ventText.trim().length === 0) return
    try {
      // IMPORTANT: vent text is sent to the API and then discarded — never stored
      const result = await vent.mutateAsync({ text: ventText })
      setVentResult(result)
      setStep("reflect")
    } catch (e) {
      // Show error inline; text is preserved in state for retry
      console.error("Vent failed:", getErrorMessage(e))
    }
  }

  // ── Step 3: Request a reframe/reflection ────────────────────────
  async function handleReframe() {
    if (ventText.trim().length === 0) return
    try {
      const result = await reframe.mutateAsync({
        text: ventText,
        prompt_style: "gentle",
        consent_to_ai_processing: consentToAI,
      })
      setReframeResult(result)
    } catch {
      // Reflection failure is non-fatal
    }
  }

  // ── Step 3 → 4: Move to after mood check-in ─────────────────────
  function handleContinueToAfter() {
    setStep("after")
  }

  // ── Step 4: Save after-score and navigate to session detail ─────
  async function handleFinish() {
    if (afterScore !== null && checkin) {
      try {
        await updateCheckIn.mutateAsync({
          id: checkin.id,
          body: { after_score: afterScore },
        })
      } catch {
        // Non-fatal
      }
    }
    navigate(checkin ? `/sessions/${checkin.id}` : "/sessions", { replace: true })
  }

  function handleDoneWithoutAfter() {
    navigate(checkin ? `/sessions/${checkin.id}` : "/sessions", { replace: true })
  }

  // ── Safety notice shown if API returns crisis indicators ─────────
  const safetyNotice = ventResult?.safety_notice ?? reframeResult?.safety_notice
  const needsHumanSupport = reframeResult?.needs_human_support ?? false
  const crisisResources =
    ventResult?.crisis_resources ?? reframeResult?.crisis_resources ?? null

  // ════════════════════════════════════════════════════════════════
  // STEP 1 — Before mood check-in
  // ════════════════════════════════════════════════════════════════
  if (step === "before") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Step indicator */}
        <div className="text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Step 1 of 2 · Before We Begin
          </p>
          <h1 className="text-3xl font-light tracking-wide text-foreground sm:text-4xl">
            How are you feeling right now?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Take a breath. There are no right or wrong answers, and no one is evaluating you.
          </p>
        </div>

        {/* Breathing cue */}
        <p className="text-center text-xs text-muted-foreground">
          breathe in <span aria-hidden>〰️</span> release
        </p>

        <MoodScale
          name="before"
          legend="How are you feeling right now?"
          value={beforeScore}
          onChange={setBeforeScore}
        />

        {/* Dynamic feedback */}
        {beforeScore !== null && (
          <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              {moodLabel(beforeScore)} · Space opening up for your thoughts.
            </p>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Step 1 Ready
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="w-full max-w-xs gap-2"
            disabled={beforeScore === null || createCheckIn.isPending}
            onClick={handleContinueToWrite}
          >
            {createCheckIn.isPending
              ? "One moment…"
              : "Continue to writing space"}
            <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <button
            type="button"
            onClick={handleSkipToWrite}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Skip for now — I just want to write
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Only you can see this · Never used for profiling or algorithms
        </p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 2 — Writing space
  // ════════════════════════════════════════════════════════════════
  if (step === "write") {
    const charCount = ventText.length
    const wordCount = ventText.trim() === "" ? 0 : ventText.trim().split(/\s+/).length
    const canSubmit = ventText.trim().length > 0 && !vent.isPending

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Step 2 of 2 · Air It Out
          </p>
          {beforeScore !== null && (
            <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              Feeling: {moodLabel(beforeScore)}
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

        {/* Writing canvas */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-8 rounded-full bg-primary" aria-hidden />
              Your Words
            </p>
            <p className="text-xs text-muted-foreground">
              {vent.isSuccess ? "Saved" : "Autosaved locally"}
            </p>
          </div>
          <Textarea
            id="vent-entry"
            value={ventText}
            maxLength={VENT_MAX}
            autoComplete="off"
            spellCheck
            placeholder="Write whatever's on your mind. This is just for you."
            className="min-h-72 resize-y border-0 bg-transparent p-5 text-base leading-relaxed shadow-none focus-visible:ring-0"
            onChange={(e) => setVentText(e.target.value)}
            aria-label="Your words"
          />
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <LuLock className="h-3.5 w-3.5" aria-hidden />
              Only you can see this · End-to-end local privacy
            </span>
            <span>
              {wordCount} word{wordCount !== 1 ? "s" : ""} · {charCount.toLocaleString()} characters
            </span>
          </div>
        </div>

        {/* Error state */}
        {vent.isError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{getErrorMessage(vent.error)} Your text is still here — you can try again.</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 text-sm text-muted-foreground opacity-50"
            title="Draft saving is local"
          >
            Save as private draft
          </button>
          <Button
            size="lg"
            className="gap-2"
            disabled={!canSubmit}
            onClick={handleVent}
          >
            {vent.isPending ? "Saving…" : "Save & reflect →"}
          </Button>
        </div>

        {/* Gentle pause note */}
        <div className="flex items-start gap-3 rounded-xl border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          <LuSparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold text-secondary-foreground uppercase tracking-widest text-xs">Gentle Pause</p>
            <p className="mt-0.5">No rush to finish. When you save, we&apos;ll quietly help you decompress.</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          AirSpace is designed as an emotional exhalation. Never used for public discovery.
        </p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 3 — Decompress & Reframe
  // ════════════════════════════════════════════════════════════════
  if (step === "reflect") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Step 2.5 · Decompress &amp; Reframe
          </p>
          {beforeScore !== null && (
            <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              Initial feeling: {moodLabel(beforeScore)} ({beforeScore}/5)
            </span>
          )}
        </div>

        {/* Safety notice */}
        {(safetyNotice || needsHumanSupport) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {safetyNotice ?? "It sounds like you may benefit from human support right now."}
            </p>
            <CrisisDialog
              trigger={
                <button className="mt-2 text-xs font-medium text-amber-800 underline underline-offset-4 dark:text-amber-300">
                  View crisis resources →
                </button>
              }
            />
          </div>
        )}

        {/* Vent acknowledgement */}
        {ventResult && (
          <div className="rounded-2xl border-l-4 border-primary bg-card p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your Words · Only you can see this
            </p>
            <p className="text-base italic text-muted-foreground leading-relaxed">
              {ventResult.acknowledgement}
            </p>
          </div>
        )}

        {/* Reflection prompts from vent */}
        {ventResult && ventResult.reflection_prompts.length > 0 && !reframeResult && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              A few things to sit with:
            </p>
            <ul className="space-y-2">
              {ventResult.reflection_prompts.map((prompt, i) => (
                <li
                  key={i}
                  className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reframe result */}
        {reframeResult && reframeResult.reflection && (
          <div className="rounded-2xl border bg-ai p-6 shadow-sm">
            {/* Provenance header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-ai-border bg-card/50 px-3 py-1 text-xs font-medium text-ai-foreground">
                <LuSparkles className="h-3 w-3" aria-hidden />
                {reframeResult.ai_status === "success"
                  ? "AI-generated reflection"
                  : "Reflection"}{" "}
                · Not advice or a diagnosis.
              </span>
              <span className="text-xs text-muted-foreground">Stored privately</span>
            </div>

            <p className="whitespace-pre-wrap break-words leading-relaxed text-ai-foreground">
              {reframeResult.reflection}
            </p>

            {/* Consent disclosure */}
            {reframeResult.ai_status === "consent_required" && (
              <div className="mt-4 rounded-lg border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentToAI}
                    onChange={(e) => setConsentToAI(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I consent to AI processing of my text for a more personalised reflection.{" "}
                    <span className="text-primary">
                      (Your raw words are never stored or used for training.)
                    </span>
                  </span>
                </label>
                {consentToAI && (
                  <Button
                    size="sm"
                    className="mt-2 gap-1"
                    disabled={reframe.isPending}
                    onClick={handleReframe}
                  >
                    <LuSparkles className="h-3.5 w-3.5" aria-hidden />
                    {reframe.isPending ? "Reflecting…" : "Get AI reflection"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Request reflection */}
        {!reframeResult && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="gap-2"
              disabled={reframe.isPending}
              onClick={handleReframe}
            >
              <LuSparkles className="h-4 w-4" aria-hidden />
              {reframe.isPending
                ? "Taking a thoughtful look…"
                : reframe.isError
                  ? "Try reflection again"
                  : "Get a gentle reflection"}
            </Button>
          </div>
        )}

        {reframe.isError && (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t generate a reflection right now. Your entry is saved and safe.
          </p>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button size="lg" className="gap-2" onClick={handleContinueToAfter}>
            Continue to After Mood Check-In
            <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <button
            type="button"
            onClick={handleDoneWithoutAfter}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Skip closing check-in
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          AirSpace isn&apos;t therapy or an emergency service. Call or text{" "}
          <a href="tel:988" className="font-semibold text-foreground">988</a>{" "}
          (USA &amp; Canada) · Text{" "}
          <strong className="text-foreground">HOME</strong> to{" "}
          <strong className="text-foreground">741741</strong>
        </p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // STEP 4 — Closing check-in (after mood)
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Step indicator */}
      <div className="text-center">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          Step 3 of 3 · Closing Check-In
        </p>
        <h1 className="text-3xl font-light tracking-wide text-foreground sm:text-4xl">
          How are you feeling now?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Take a breath and notice what shifted, even subtly. No right or wrong answers.
        </p>
      </div>

      {/* Breathing cue */}
      <p className="text-center text-xs text-muted-foreground">Pause · Notice your breath</p>

      <MoodScale
        name="after"
        legend="How are you feeling now?"
        value={afterScore}
        onChange={setAfterScore}
      />

      {/* Before → After comparison */}
      {beforeScore !== null && afterScore !== null && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-around gap-4 text-sm">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <p className="text-xs uppercase tracking-widest">Before Entry</p>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-input bg-muted text-lg">
                {beforeScore === 1 ? "💧" : beforeScore === 2 ? "☁️" : beforeScore === 3 ? "—" : beforeScore === 4 ? "🌬️" : "🌿"}
              </div>
              <p className="font-medium">{moodLabel(beforeScore)}</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <LuArrowRight className="h-5 w-5" aria-hidden />
              <p>decompress</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Now</p>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-lg">
                {afterScore === 1 ? "💧" : afterScore === 2 ? "☁️" : afterScore === 3 ? "—" : afterScore === 4 ? "🌬️" : "🌿"}
              </div>
              <p className="font-medium text-primary">{moodLabel(afterScore)}</p>
            </div>
          </div>
          {/* Narrative summary */}
          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-center text-foreground">
            You started at <strong>{moodLabel(beforeScore)}</strong> and ended at{" "}
            <strong className="text-primary">{moodLabel(afterScore)}</strong>.{" "}
            {afterScore >= beforeScore
              ? "Giving your thoughts a quiet place to land created a little breathing room."
              : "It takes courage to be honest about where you are. That matters."}
          </div>
        </div>
      )}

      {/* Summary strip */}
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <LuSparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          Entry saved · {reframeResult ? "1 companion reflection attached" : "No reflection attached"}
        </span>
        <span className="flex items-center gap-1.5">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Private &amp; Encrypted
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          className="gap-2"
          disabled={updateCheckIn.isPending}
          onClick={handleFinish}
        >
          {updateCheckIn.isPending ? "Saving…" : "Done ✓"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={handleDoneWithoutAfter}
        >
          View this session
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        AirSpace isn&apos;t therapy or an emergency service. Call or text{" "}
        <a href="tel:988" className="font-semibold text-foreground">988</a>{" "}
        (USA &amp; Canada) · Text{" "}
        <strong className="text-foreground">HOME</strong> to{" "}
        <strong className="text-foreground">741741</strong>
      </p>
    </div>
  )
}
