import { Link } from "react-router-dom"
import { format } from "date-fns"
import { LuArrowRight, LuSparkles } from "react-icons/lu"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { moodLabel, useCheckIns } from "@/features/checkins"
import { getErrorMessage } from "@/lib/api/errors"

export default function ProgressPage() {
  const { data: checkins, isPending, error } = useCheckIns()
  const entries = checkins ?? []
  const completed = entries.filter((entry) => entry.after_score !== null)
  const averageChange =
    completed.length > 0
      ? completed.reduce(
          (total, entry) =>
            total + ((entry.after_score ?? entry.before_score) - entry.before_score),
          0,
        ) /
        completed.length
      : null
  const chartEntries = [...entries].slice(0, 8).reverse()

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your check-ins
        </p>
        <h1 className="text-3xl font-light tracking-wide text-foreground">Progress</h1>
        <p className="mt-1 text-muted-foreground">
          A look at the mood scores you chose to record, over time.
        </p>
      </header>

      {isPending && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {getErrorMessage(error)}
        </p>
      )}

      {checkins && entries.length === 0 && (
        <section className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Your check-in scores will appear here after you complete a session.
          </p>
          <Link
            to="/write"
            className={buttonVariants({ size: "lg", className: "mt-4 min-h-11 gap-2" })}
          >
            Start a session <LuArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      )}

      {entries.length > 0 && (
        <>
          <section aria-label="Progress summary" className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Sessions recorded</p>
              <p className="mt-1 text-3xl font-light text-foreground">{entries.length}</p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Average change after a check-in</p>
              <p className="mt-1 text-3xl font-light text-foreground">
                {averageChange === null
                  ? "Not enough data"
                  : `${averageChange > 0 ? "+" : ""}${averageChange.toFixed(1)} points`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {completed.length === 0
                  ? "Complete a closing check-in to see a change."
                  : `Based on ${completed.length} closing ${completed.length === 1 ? "score" : "scores"}.`}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="score-history-heading"
            className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <h2 id="score-history-heading" className="text-xl font-light tracking-wide">
                Recent mood scores
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Scores use your own 1–10 check-ins. A closing score is only shown when you recorded
                one.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
                Before
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-secondary" aria-hidden />
                Closing score
              </span>
            </div>

            <div
              role="group"
              aria-label={`Mood scores for the ${chartEntries.length} most recent sessions. Each bar is a score out of 10.`}
              className="grid grid-cols-4 gap-3 sm:grid-cols-8"
            >
              {chartEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex min-w-0 flex-col items-center gap-2"
                  title={`${format(new Date(entry.created_at), "MMM d")}: before ${entry.before_score}/10${entry.after_score === null ? "" : `, closing ${entry.after_score}/10`}`}
                >
                  <div className="flex h-32 w-full items-end justify-center gap-1 border-b border-border px-1">
                    <span
                      className="block w-3 max-w-[35%] rounded-t-sm bg-primary"
                      style={{ height: `${entry.before_score * 10}%` }}
                    />
                    {entry.after_score !== null && (
                      <span
                        className="block w-3 max-w-[35%] rounded-t-sm bg-secondary"
                        style={{ height: `${entry.after_score * 10}%` }}
                      />
                    )}
                  </div>
                  <span className="text-center text-[10px] leading-tight text-muted-foreground">
                    {format(new Date(entry.created_at), "MMM d")}
                  </span>
                  <span className="text-center text-[10px] leading-tight text-muted-foreground">
                    {entry.before_score}
                    {entry.after_score === null ? "" : ` / ${entry.after_score}`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="recent-scores-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="recent-scores-heading" className="text-xl font-light tracking-wide">
                Recent check-ins
              </h2>
              <Link
                to="/entries"
                className="inline-flex min-h-11 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
              >
                View reflections <LuArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="space-y-2">
              {chartEntries.slice(-4).reverse().map((entry) => (
                <li key={entry.id}>
                  <Link
                    to={`/entries/${entry.id}`}
                    className="flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-muted-foreground">
                      {format(new Date(entry.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{moodLabel(entry.before_score)} · {entry.before_score}/10</span>
                      {entry.after_score !== null && (
                        <span className="flex items-center gap-1 text-primary">
                          <LuSparkles className="h-3.5 w-3.5" aria-hidden />
                          {entry.after_score}/10
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
