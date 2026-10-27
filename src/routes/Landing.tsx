import { Link } from "react-router-dom"
import { SupportDialog } from "@/components/SupportDialog"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <h1 className="font-heading text-4xl font-light leading-tight tracking-wide sm:text-5xl">
          A private space to get it out.
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Write what&apos;s on your mind, get a gentle reflection, and notice how you feel before and after.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex h-11 min-w-44 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start airing it out
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 min-w-28 items-center justify-center rounded-lg px-6 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Feature cards */}
      <section
        aria-labelledby="features-heading"
        className="bg-secondary/50 px-4 py-16"
      >
        <h2 id="features-heading" className="sr-only">How it works</h2>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-heading text-lg">Air It Out</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Write freely, without judgment. Your words are private and only ever visible to you.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-heading text-lg">Decompress &amp; Reframe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask for a gentle AI-assisted reflection on your words. It never rewrites or edits what you wrote.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-heading text-lg">Track Your Reset</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Check in on how you feel before and after. Notice the shift, without needing to analyse it.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy strip */}
      <section className="border-t px-4 py-12">
        <ul className="mx-auto flex max-w-2xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-around">
          <li>Only you can see your entries</li>
          <li>Delete any session or your whole account, anytime</li>
          <li>The AI never changes your words</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        AirSpace isn&apos;t therapy or an emergency service. <SupportDialog />
      </footer>
    </div>
  )
}
