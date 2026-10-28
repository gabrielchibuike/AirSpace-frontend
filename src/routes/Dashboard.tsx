import { Link } from "react-router-dom"
import { format } from "date-fns"
import { LuArrowRight, LuSparkles, LuMessageCircle } from "react-icons/lu"
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sanctuary space
          </p>
          <h1 className="text-3xl font-light tracking-wide">
            {user?.email ? `Welcome back, ${user.email.split("@")[0]}.` : "Welcome back."}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your unhurried space is ready whenever you need to exhale.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
          <LuSparkles className="h-3.5 w-3.5" aria-hidden />
          Entries are stored in your account
        </span>
      </div>

      <section aria-labelledby="cta-heading" className="rounded-2xl border bg-card p-8 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <LuSparkles className="h-3.5 w-3.5" aria-hidden />
          Air it out
        </p>
        <h2 id="cta-heading" className="mb-3 text-2xl font-light tracking-wide text-foreground">
          Start a new air-it-out session
        </h2>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          Take a moment. Rate how you feel from 1 to 10, write what&apos;s on your mind, and see
          what shifted afterwards. You can type or record your voice.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Button size="lg" className="gap-2" render={<Link to="/write" />}>
            Begin session <LuArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="secondary" size="lg" className="gap-2" render={<Link to="/chat" />}>
            <LuMessageCircle className="h-4 w-4" aria-hidden />
            Or talk it through
          </Button>
          <p className="text-xs text-muted-foreground">No timer, no rush</p>
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="text-xl font-light tracking-wide">
            Recent entries ({data?.length ?? "…"})
          </h2>
          <Link
            to="/entries"
            className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            View all <LuArrowRight className="h-4 w-4" aria-hidden />
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
              Your entries will appear here once you&apos;ve written one.
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
                to={`/entries/${checkin.id}`}
                className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(checkin.created_at), "MMM d 'at' h:mm a")}
                  </p>
                  {checkin.emotion && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {checkin.emotion}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                    {moodLabel(checkin.before_score)} {checkin.before_score}/10
                  </span>
                  {checkin.after_score !== null && (
                    <>
                      <LuArrowRight className="h-4 w-4 text-muted-foreground" aria-label="to" />
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-primary">
                        {moodLabel(checkin.after_score)} {checkin.after_score}/10
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
                  Open entry <LuArrowRight className="h-3 w-3" aria-hidden />
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
