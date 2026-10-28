import { Link } from "react-router-dom"
import { format } from "date-fns"
import { LuArrowRight, LuLock, LuSparkles } from "react-icons/lu"
import { Skeleton } from "@/components/ui/skeleton"
import { useCheckIns } from "@/features/checkins"
import { moodLabel } from "@/features/checkins/MoodScale"
import { getErrorMessage } from "@/lib/api/errors"

export default function HistoryPage() {
  const { data, isPending, error } = useCheckIns()
  // API returns newest-first
  const sorted = data ?? []

  // Group by month, preserving newest-first order
  const groups: Map<string, typeof sorted> = new Map()
  for (const checkin of sorted) {
    const key = format(new Date(checkin.created_at), "MMMM yyyy")
    const existing = groups.get(key)
    if (existing) {
      existing.push(checkin)
    } else {
      groups.set(key, [checkin])
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <span className="flex items-center gap-1.5 w-fit rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground mb-3">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Only you can see this vault · End-to-end encrypted
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground">Past Reflections</h1>
        <p className="mt-1 text-muted-foreground">
          An unhurried record of what you&apos;ve held and let breathe.
        </p>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {isPending && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(error)}
        </p>
      )}

      {/* ── Empty ───────────────────────────────────────────────────── */}
      {data && sorted.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
          <p className="text-muted-foreground">No sessions yet.</p>
          <Link
            to="/write"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Start your first session
          </Link>
        </div>
      )}

      {/* ── Session groups ───────────────────────────────────────────── */}
      {Array.from(groups.entries()).map(([month, checkins]) => (
        <section
          key={month}
          aria-labelledby={`month-${month.replace(/\s/g, "-")}`}
          className="space-y-3"
        >
          <div className="flex items-baseline gap-3">
            <h2
              id={`month-${month.replace(/\s/g, "-")}`}
              className="text-lg font-light tracking-wide text-foreground"
            >
              {month}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {checkins.length} session{checkins.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {checkins.map((checkin) => (
              <Link
                key={checkin.id}
                to={`/sessions/${checkin.id}`}
                className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Row 1: timestamp + badge */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-foreground">
                      {format(new Date(checkin.created_at), "MMM d, h:mm a")}
                    </p>
                    {checkin.after_score !== null && (
                      <span className="flex items-center gap-1 rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        <LuSparkles className="h-3 w-3" aria-hidden />
                        Reflected
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="More options"
                  >
                    ···
                  </button>
                </div>

                {/* Row 2: mood shift */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 font-medium text-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" aria-hidden />
                    {moodLabel(checkin.before_score)} ({checkin.before_score}/5)
                  </span>
                  {checkin.after_score !== null && (
                    <>
                      <LuArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-label="shifted to" />
                      <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-1 font-medium text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                        {moodLabel(checkin.after_score)} ({checkin.after_score}/5)
                      </span>
                    </>
                  )}
                </div>

                {/* Row 3: note excerpt */}
                {checkin.note && (
                  <p className="mt-3 line-clamp-2 break-words text-sm italic text-muted-foreground">
                    &ldquo;{checkin.note}&rdquo;
                  </p>
                )}

                {/* Row 4: footer */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <LuLock className="h-3.5 w-3.5" aria-hidden />
                    Encrypted locally
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    Read entry &amp; reflection
                    <LuArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* ── Footer note ─────────────────────────────────────────────── */}
      {sorted.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          AirSpace isn&apos;t therapy or an emergency service. Call or text{" "}
          <a href="tel:988" className="font-semibold text-foreground">988</a>{" "}
          (USA &amp; Canada) · Text{" "}
          <strong className="text-foreground">HOME</strong> to{" "}
          <strong className="text-foreground">741741</strong>
        </p>
      )}
    </div>
  )
}
