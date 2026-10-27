import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { SessionCard, sortNewestFirst, useSessions } from "@/features/sessions"
import { getErrorMessage } from "@/lib/api/errors"

export default function HistoryPage() {
  const { data, isPending, error } = useSessions()
  const sorted = sortNewestFirst(data ?? [])

  // Group by month, preserving newest-first order
  const groups: Map<string, typeof sorted> = new Map()
  for (const session of sorted) {
    const key = format(new Date(session.created_at), "MMMM yyyy")
    const existing = groups.get(key)
    if (existing) {
      existing.push(session)
    } else {
      groups.set(key, [session])
    }
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl">History</h1>

      {isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
      {error && <p role="alert">{getErrorMessage(error)}</p>}

      {data && sorted.length === 0 && (
        <p className="text-muted-foreground">
          No sessions yet.{" "}
          <Link to="/write" className="underline underline-offset-4">
            Start writing
          </Link>
        </p>
      )}

      {Array.from(groups.entries()).map(([month, sessions]) => (
        <section key={month} aria-labelledby={`month-${month.replace(/\s/g, "-")}`} className="space-y-4">
          <h2 id={`month-${month.replace(/\s/g, "-")}`} className="text-lg text-muted-foreground">
            {month}
          </h2>
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
