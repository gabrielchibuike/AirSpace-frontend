import { Link } from "react-router-dom"
import { format } from "date-fns"
import { LuArrowRight, LuSparkles } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useInfiniteCheckIns } from "@/features/checkins"
import { useCapabilities } from "@/features/capabilities"
import { moodLabel } from "@/features/checkins/MoodScale"
import { getErrorMessage } from "@/lib/api/errors"

const DEFAULT_PAGE_SIZE = 100

export default function HistoryPage() {
  const capabilities = useCapabilities()
  const pageSize = capabilities.data?.checkins_page_size ?? DEFAULT_PAGE_SIZE
  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCheckIns(pageSize)
  const sorted = data?.pages.flat() ?? []

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
      <div>
        <span className="mb-3 flex w-fit items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Stored in your account · not end-to-end encrypted
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground">Past entries</h1>
        <p className="mt-1 text-muted-foreground">
          Your check-ins, the notes you kept, and how your mood moved.
        </p>
      </div>

      {isPending && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(error)}
        </p>
      )}

      {data && sorted.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
          <p className="text-muted-foreground">No entries yet.</p>
          <Link
            to="/write"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Start your first entry
          </Link>
        </div>
      )}

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
              {checkins.length} {checkins.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="space-y-3">
            {checkins.map((checkin) => (
              <Link
                key={checkin.id}
                to={`/entries/${checkin.id}`}
                className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-foreground">
                      {format(new Date(checkin.created_at), "MMM d, h:mm a")}
                    </p>
                    {checkin.after_score !== null && (
                      <span className="flex items-center gap-1 rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        <LuSparkles className="h-3 w-3" aria-hidden />
                        Closing score recorded
                      </span>
                    )}
                  </div>
                  {checkin.emotion && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {checkin.emotion}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 font-medium text-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" aria-hidden />
                    {moodLabel(checkin.before_score)} ({checkin.before_score}/10)
                  </span>
                  {checkin.after_score !== null && (
                    <>
                      <LuArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="shifted to" />
                      <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-1 font-medium text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                        {moodLabel(checkin.after_score)} ({checkin.after_score}/10)
                      </span>
                    </>
                  )}
                </div>

                {checkin.note && (
                  <p className="mt-3 line-clamp-2 break-words text-sm italic text-muted-foreground">
                    &ldquo;{checkin.note}&rdquo;
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Note saved · reflections aren&apos;t stored</span>
                  <span className="flex items-center gap-1 text-primary">
                    Open entry
                    <LuArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading older entries…" : "Load older entries"}
          </Button>
        </div>
      )}
      {data && !hasNextPage && sorted.length >= pageSize && (
        <p className="text-center text-xs text-muted-foreground">You’re all caught up.</p>
      )}
    </div>
  )
}
