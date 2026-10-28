import { Link } from "react-router-dom"
import { format } from "date-fns"
import { LuArrowRight, LuSparkles, LuLock } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCheckIns } from "@/features/checkins"
import { useMe } from "@/features/auth"
import { getErrorMessage } from "@/lib/api/errors"
import { moodLabel } from "@/features/checkins/MoodScale"

export default function DashboardPage() {
  const { data: user } = useMe()
  const { data, isPending, error } = useCheckIns()
  const recent = (data ?? []).slice(0, 3) // API returns newest-first (max 100)

  return (
    <div className="space-y-8">
      {/* ── Sanctuary header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sanctuary Space
          </p>
          <h1 className="text-3xl font-light tracking-wide">Welcome back.</h1>
          <p className="mt-1 text-muted-foreground">
            Your unhurried space is ready whenever you need to exhale.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Only you can see this vault · 256-bit encrypted
        </span>
      </div>

      {/* ── Begin session CTA ───────────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-2xl border bg-card p-8 shadow-sm"
      >
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <LuSparkles className="h-3.5 w-3.5" aria-hidden />
          Air It Out
        </p>
        <h2 id="cta-heading" className="mb-3 text-2xl font-light tracking-wide text-foreground">
          Start a new Air It Out session
        </h2>
        <p className="mb-6 text-muted-foreground leading-relaxed">
          Take a moment. Nothing here is judged. A blank canvas for your raw thoughts,
          a gentle companion reflection, and space to notice how you feel.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" className="gap-2" render={<Link to="/write" />}>
            Begin session <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <p className="text-xs text-muted-foreground">
            Average time: ~3 to 5 minutes · No timer, no rush
          </p>
        </div>
      </section>

      {/* ── Recent sessions ─────────────────────────────────────────── */}
      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="text-xl font-light tracking-wide">
            Recent sessions ({data?.length ?? "…"})
          </h2>
          <Link
            to="/sessions"
            className="flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
          >
            View all in History <LuArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {isPending && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}

        {data && recent.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed bg-card p-10 text-center">
            <p className="text-muted-foreground">
              Your sessions will appear here once you&apos;ve written one.
            </p>
            <Button className="mt-4" size="lg" render={<Link to="/write" />}>
              Start writing
            </Button>
          </div>
        )}

        {recent.length > 0 && (
          <div className="space-y-3">
            {recent.map((checkin) => (
              <Link
                key={checkin.id}
                to={`/sessions/${checkin.id}`}
                className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(checkin.created_at), "MMM d 'at' h:mm a")}
                  </p>
                  {checkin.after_score !== null && (
                    <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      <LuSparkles className="h-3 w-3" aria-hidden />
                      Reflected
                    </span>
                  )}
                </div>

                {/* Mood shift */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                    {moodLabel(checkin.before_score)} {checkin.before_score}/5
                  </span>
                  {checkin.after_score !== null && (
                    <>
                      <LuArrowRight className="h-4 w-4 text-muted-foreground" aria-label="to" />
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-primary">
                        {moodLabel(checkin.after_score)} {checkin.after_score}/5
                      </span>
                    </>
                  )}
                </div>

                {checkin.note && (
                  <p className="mt-3 line-clamp-2 break-words text-sm italic text-muted-foreground">
                    &ldquo;{checkin.note}&rdquo;
                  </p>
                )}

                <p className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                  Read entry &amp; reflection <LuArrowRight className="h-3 w-3" aria-hidden />
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
