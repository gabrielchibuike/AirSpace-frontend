import { useState } from "react"
import { format } from "date-fns"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { LuArrowLeft, LuSparkles, LuTrash2, LuTriangleAlert } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SafetyNotice } from "@/components/SafetyNotice"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { useCheckIns, useDeleteCheckIn, useUpdateCheckIn } from "@/features/checkins"
import { MoodScale, moodIcon, moodLabel } from "@/features/checkins/MoodScale"
import { useReframe } from "@/features/vent/hooks"
import type { CrisisResource } from "@/features/checkins/api"
import { ApiError, getErrorMessage } from "@/lib/api/errors"

const NOTE_MAX = 500
const EMOTION_MAX = 80

export default function SessionPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const checkinId = parseInt(id, 10)

  const { data: checkins, isPending, error } = useCheckIns()
  const deleteCheckIn = useDeleteCheckIn()
  const updateCheckIn = useUpdateCheckIn()
  const reframe = useReframe()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [after, setAfter] = useState<number | null>(null)
  const [consent, setConsent] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [reflection, setReflection] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ notice: string; resources: CrisisResource[] | null } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [emotionDraft, setEmotionDraft] = useState("")

  // The API has no GET /checkins/{id}; the list is capped at 100, so an older
  // entry can genuinely be missing here.
  const checkin = checkins?.find((c) => c.id === checkinId)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !checkin || Number.isNaN(checkinId)) {
    return (
      <div className="space-y-4">
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error ? getErrorMessage(error) : "We couldn't find that entry. It may be older than the 100 entries this screen can load."}
        </p>
        <Link to="/entries" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to history
        </Link>
      </div>
    )
  }

  const c = checkin

  const activeNotice = notice ?? (
    c.safety_notice ? { notice: c.safety_notice, resources: c.crisis_resources } : null
  )

  if (activeNotice) {
    return (
      <article className="space-y-6">
        <SafetyNotice notice={activeNotice.notice} resources={activeNotice.resources} />
      </article>
    )
  }

  function handleDelete() {
    deleteCheckIn.mutate(c.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success("Entry deleted")
        navigate("/entries", { replace: true })
      },
      onError: () => toast.error("We couldn't delete that entry. Please try again."),
    })
  }

  function saveAfter() {
    if (after === null) return
    setActionError(null)
    updateCheckIn.mutate(
      { id: c.id, body: { after_score: after } },
      {
        onSuccess: (result) => {
          if (result.safety_notice) {
            setNotice({ notice: result.safety_notice, resources: result.crisis_resources })
            return
          }
          toast.success("Closing score saved")
        },
        onError: (e) => setActionError(getErrorMessage(e)),
      },
    )
  }

  function startEditing() {
    setNoteDraft(c.note ?? "")
    setEmotionDraft(c.emotion ?? "")
    setEditing(true)
    setActionError(null)
  }

  function saveNote() {
    setActionError(null)
    updateCheckIn.mutate(
      {
        id: c.id,
        body: {
          note: noteDraft.trim().slice(0, NOTE_MAX) || null,
          emotion: emotionDraft.trim().slice(0, EMOTION_MAX) || null,
        },
      },
      {
        onSuccess: (result) => {
          if (result.safety_notice) {
            setNotice({ notice: result.safety_notice, resources: result.crisis_resources })
            setEditing(false)
            return
          }
          setEditing(false)
          toast.success("Note updated")
        },
        onError: (e) => setActionError(getErrorMessage(e)),
      },
    )
  }

  function requestReflection(withConsent = false) {
    if (!c.note) return
    setActionError(null)
    reframe.mutate(
      { text: c.note, prompt_style: "gentle", consent_to_ai_processing: withConsent },
      {
        onSuccess: (result) => {
          if (result.safety_notice) {
            setNotice({ notice: result.safety_notice, resources: result.crisis_resources })
            setNeedsConsent(false)
            return
          }
          if (result.ai_status === "consent_required") {
            setNeedsConsent(true)
            return
          }
          setNeedsConsent(false)
          setReflection(result.reflection)
        },
        onError: (e) => {
          setActionError(getErrorMessage(e))
          if (e instanceof ApiError && e.status === 429) setNeedsConsent(false)
        },
      },
    )
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/entries"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to history
        </Link>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger render={<Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive" />}>
            <LuTrash2 className="h-4 w-4" aria-hidden />
            Delete
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this entry?</DialogTitle>
              <DialogDescription>
                The score, note and emotion for this entry are removed from the server. This
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteCheckIn.isPending}>
                {deleteCheckIn.isPending ? "Deleting…" : "Yes, delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(c.created_at), "MMMM d, yyyy · h:mm a")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Stored in your account · visible wherever you are signed in
        </p>
      </div>

      <section aria-label="Your note" className="rounded-2xl border-l-4 border-primary bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your note
            {c.emotion && !editing && <span className="ml-2 font-normal normal-case">· {c.emotion}</span>}
          </p>
          {editing ? (
            <span className="text-xs text-muted-foreground">
              {noteDraft.length}/{NOTE_MAX} characters
            </span>
          ) : (
            <Button variant="ghost" size="xs" onClick={startEditing}>
              Edit note
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <textarea
              value={noteDraft}
              maxLength={NOTE_MAX}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={5}
              aria-label="Edit this entry's note"
              className="w-full resize-y rounded-lg border bg-background p-3 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={emotionDraft}
              maxLength={EMOTION_MAX}
              onChange={(e) => setEmotionDraft(e.target.value)}
              placeholder="One word for how it felt (optional)"
              aria-label="Emotion word"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={saveNote} disabled={updateCheckIn.isPending}>
                {updateCheckIn.isPending ? "Saving…" : "Save note"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Emptying both fields clears the note and emotion from this entry.
            </p>
          </div>
        ) : c.note ? (
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
            &ldquo;{c.note}&rdquo;
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No note was kept for this entry. Only the first 500 characters are stored, and the
            full vent text is never saved.
          </p>
        )}
      </section>

      <section aria-label="Companion reflection" className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Reflection
          </p>
          <span className="text-xs text-muted-foreground">Reflections are never stored</span>
        </div>

        {reflection && (
          <div className="rounded-xl border border-ai-border bg-ai p-4 text-sm text-ai-foreground">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
              <LuSparkles className="h-3.5 w-3.5" aria-hidden />
              New reflection from DeepSeek · not advice or a diagnosis
            </p>
            <p className="whitespace-pre-wrap break-words leading-relaxed">{reflection}</p>
          </div>
        )}

        {!c.note && !reflection && (
          <p className="text-sm text-muted-foreground">
            There&apos;s no saved note to reflect on. The original vent text was processed and
            discarded.
          </p>
        )}

        {c.note && !reflection && (
          <>
            <p className="text-sm text-muted-foreground">
              You can ask for a fresh reflection on the saved note. It isn&apos;t saved either.
            </p>
            {needsConsent ? (
              <div className="rounded-xl border bg-secondary/40 px-4 py-3 text-sm">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I consent to this note being sent to <strong className="text-foreground">DeepSeek</strong>,
                    an external AI provider. It handles the text under its own terms and privacy policy.
                  </span>
                </label>
                <Button
                  size="sm"
                  className="mt-3 gap-1.5"
                  disabled={!consent || reframe.isPending}
                  onClick={() => requestReflection(true)}
                >
                  <LuSparkles className="h-3.5 w-3.5" aria-hidden />
                  {reframe.isPending ? "Reflecting…" : "Send with consent"}
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="gap-2"
                disabled={reframe.isPending}
                onClick={() => requestReflection(false)}
              >
                <LuSparkles className="h-4 w-4" aria-hidden />
                {reframe.isPending ? "Taking a thoughtful look…" : "Reflect on this note"}
              </Button>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="reset-heading" className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <h2 id="reset-heading" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your reset
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The mood shift recorded with this entry.
          </p>
        </div>

        <div className="flex items-center justify-around gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">Before</p>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-input bg-muted text-xl">
              {moodIcon(c.before_score)}
            </div>
            <p className="font-medium text-foreground">{moodLabel(c.before_score)}</p>
            <p className="text-xs text-muted-foreground">{c.before_score}/10</p>
          </div>

          {c.after_score !== null ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-muted-foreground">After</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl">
                {moodIcon(c.after_score)}
              </div>
              <p className="font-medium text-primary">{moodLabel(c.after_score)}</p>
              <p className="text-xs text-muted-foreground">{c.after_score}/10</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <p className="text-xs">After</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-input bg-muted text-xl opacity-40">
                ?
              </div>
              <p className="text-xs">Not recorded</p>
            </div>
          )}
        </div>

        {c.after_score === null && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              You can still record how you feel now. It saves to this entry.
            </p>
            <MoodScale
              name="closing"
              legend="Record a closing score for this entry"
              value={after}
              onChange={setAfter}
            />
            <Button size="sm" onClick={saveAfter} disabled={after === null || updateCheckIn.isPending}>
              {updateCheckIn.isPending ? "Saving…" : "Save closing score"}
            </Button>
          </div>
        )}

        {actionError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {actionError}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Link to="/entries" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to history
        </Link>
        <Link
          to="/write"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <LuSparkles className="h-4 w-4" aria-hidden />
          Start another session
        </Link>
      </div>
    </article>
  )
}

