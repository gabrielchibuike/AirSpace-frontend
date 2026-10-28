import { useState } from "react"
import { format } from "date-fns"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { LuArrowLeft, LuSparkles, LuLock, LuTrash2, LuArrowRight } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { useCheckIns, useDeleteCheckIn } from "@/features/checkins"
import { moodLabel } from "@/features/checkins/MoodScale"
import { getErrorMessage } from "@/lib/api/errors"
import { CrisisDialog } from "@/components/CrisisDialog"

export default function SessionPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const checkinId = parseInt(id, 10)

  const { data: checkins, isPending, error } = useCheckIns()
  const deleteCheckIn = useDeleteCheckIn()
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Find this specific check-in from the cached list
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

  if (error || (!isPending && !checkin)) {
    return (
      <div className="space-y-4">
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(error) || "We couldn't find that session."}
        </p>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to History
        </Link>
      </div>
    )
  }

  // This is guaranteed non-null after the guard above
  const c = checkin!

  function handleDelete() {
    deleteCheckIn.mutate(c.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        toast.success("Session deleted")
        navigate("/sessions", { replace: true })
      },
      onError: () => toast.error("We couldn't delete that session. Please try again."),
    })
  }

  const hasReflection = c.after_score !== null

  return (
    <article className="space-y-6">
      {/* ── Top actions ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/sessions"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to History
        </Link>
        <div className="flex items-center gap-2">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive" />}>
              <LuTrash2 className="h-4 w-4" aria-hidden />
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this session?</DialogTitle>
                <DialogDescription>
                  Your check-in record will be permanently removed. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteCheckIn.isPending}
                >
                  {deleteCheckIn.isPending ? "Deleting…" : "Yes, delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Session meta ────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(c.created_at), "MMMM d, yyyy · h:mm a")}
          {hasReflection && (
            <>
              {" "}·{" "}
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                4 MIN DECOMPRESS
              </span>
            </>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Only you can see this entry · End-to-end encrypted
        </p>
      </div>

      {/* Reflection state tabs (visual only) */}
      {(
        <div className="flex gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 font-medium ${hasReflection ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
            {hasReflection ? "Reflection attached" : "No reflection yet"}
          </span>
        </div>
      )}

      {/* ── Your words ──────────────────────────────────────────────── */}
      <section aria-label="Your words" className="rounded-2xl border-l-4 border-primary bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Words
            {c.emotion && (
              <span className="ml-2 font-normal normal-case">· {c.emotion}</span>
            )}
          </p>
          <span className="text-xs text-muted-foreground">Preserved untouched</span>
        </div>

        {c.note ? (
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
            &ldquo;{c.note}&rdquo;
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No note was recorded for this session.
          </p>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Never modified, edited, or fed to public AI models.
        </p>
      </section>

      {/* ── AI reflection placeholder ────────────────────────────────── */}
      {/* Note: the /checkins endpoint doesn't return reflection content —
           the reflection is generated transiently via POST /reframe.
           If the user returns here after a session, we show the mood data. */}
      <section
        aria-label="Companion reflection"
        className="rounded-2xl border bg-ai p-6 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-ai-border bg-card/50 px-3 py-1 text-xs font-medium text-ai-foreground">
            <LuSparkles className="h-3 w-3" aria-hidden />
            {hasReflection
              ? "Reflection was generated during this session"
              : "No reflection was requested"}
          </span>
          <span className="text-xs text-muted-foreground">Read-only companion note</span>
        </div>

        <p className="text-sm italic text-ai-foreground">
          {hasReflection
            ? "Your reflection was processed privately and is not stored on the server. Start a new session to get another gentle companion perspective."
            : "You didn't request a reflection during this session. That's completely fine — some thoughts just need space to breathe."}
        </p>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LuSparkles className="h-3.5 w-3.5" aria-hidden />
          Reflected with unhurried tone
        </p>
      </section>

      {/* ── Your reset ──────────────────────────────────────────────── */}
      <section aria-labelledby="reset-heading" className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Reset
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The emotional shift recorded during this session.
          </p>
        </div>

        <div className="flex items-center justify-around gap-4">
          {/* Before */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">Starting weight</p>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-input bg-muted text-xl">
              {c.before_score === 1 ? "💧" : c.before_score === 2 ? "☁️" : c.before_score === 3 ? "—" : c.before_score === 4 ? "🌬️" : "🌿"}
            </div>
            <p className="font-medium text-foreground">{moodLabel(c.before_score)}</p>
            <p className="text-xs text-muted-foreground">{c.before_score}/5</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <LuArrowRight className="h-5 w-5" aria-hidden />
            <p>Deliberate exhale</p>
          </div>

          {/* After */}
          {c.after_score !== null ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-muted-foreground">Post-journal state</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl">
                {c.after_score === 1 ? "💧" : c.after_score === 2 ? "☁️" : c.after_score === 3 ? "—" : c.after_score === 4 ? "🌬️" : "🌿"}
              </div>
              <p className="font-medium text-primary">{moodLabel(c.after_score)}</p>
              <p className="text-xs text-muted-foreground">{c.after_score}/5</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <p className="text-xs">After check-in</p>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-input bg-muted text-xl opacity-40">
                ?
              </div>
              <p className="text-xs">Not recorded</p>
            </div>
          )}
        </div>

        {/* Narrative */}
        {c.after_score !== null && (
          <div className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
            <LuSparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p>
              You started at <strong>{moodLabel(c.before_score)}</strong> and ended at{" "}
              <strong className="text-primary">{moodLabel(c.after_score)}</strong>.{" "}
              {c.after_score >= c.before_score
                ? "Giving your thoughts a quiet place to land created a little breathing room."
                : "It takes courage to be honest about where you are. That matters."}
            </p>
          </div>
        )}
      </section>

      {/* ── Safety / crisis notice ───────────────────────────────────── */}
      {c.safety_notice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="font-semibold text-amber-900 dark:text-amber-200">{c.safety_notice}</p>
          <CrisisDialog
            trigger={
              <button className="mt-1 text-xs font-medium text-amber-800 underline underline-offset-4 dark:text-amber-300">
                View crisis resources →
              </button>
            }
          />
        </div>
      )}

      {/* ── Bottom navigation ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Link
          to="/sessions"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to History
        </Link>
        <Link
          to="/write"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <LuSparkles className="h-4 w-4" aria-hidden />
          Start another session
        </Link>
      </div>

      {/* ── Crisis support strip ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/30 px-4 py-3 text-sm">
        <div>
          <p className="font-semibold text-foreground">24/7 Calm Crisis Support</p>
          <p className="text-xs text-muted-foreground">
            Free, confidential support from grounded professionals whenever you need grounding.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="tel:988"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
          >
            Call or text 988
          </a>
          <CrisisDialog
            trigger={
              <button className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
                View resources
              </button>
            }
          />
        </div>
      </div>
    </article>
  )
}
