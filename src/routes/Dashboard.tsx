import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SessionCard, sortNewestFirst, useSessions } from "@/features/sessions"
import { getErrorMessage } from "@/lib/api/errors"

export default function DashboardPage() {
  const { data, isPending, error } = useSessions()
  const recent = sortNewestFirst(data ?? []).slice(0, 3)

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-secondary p-8">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Take a moment. Nothing here is judged.</p>
        <Button size="lg" className="mt-6" render={<Link to="/write" />}>
          Start a new Air It Out session
        </Button>
      </section>

      <section aria-labelledby="recent" className="space-y-4">
        <h2 id="recent" className="text-xl">Recent sessions</h2>
        {isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
        {error && <p role="alert">{getErrorMessage(error)}</p>}
        {data && recent.length === 0 && (
          <p className="text-muted-foreground">
            Your sessions will appear here once you&apos;ve written one.
          </p>
        )}
        {recent.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </section>
    </div>
  )
}
