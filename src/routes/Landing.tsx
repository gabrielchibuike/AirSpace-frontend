import { Link } from "react-router-dom"
import { LuPenLine, LuSparkles, LuActivity, LuLock, LuTrash2, LuShieldCheck } from "react-icons/lu"
import { CrisisDialog } from "@/components/CrisisDialog"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3"
        >
          <span className="mr-auto flex flex-col leading-none">
            <span className="font-heading text-base font-semibold tracking-tight text-primary">
              AirSpace
            </span>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              Vent and Decompress
            </span>
          </span>
          <a
            href="#how-it-works"
            className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline"
          >
            How It Works
          </a>
          <a
            href="#privacy"
            className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline"
          >
            Privacy Guarantee
          </a>
          <CrisisDialog
            trigger={
              <button className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline">
                Support Resources
              </button>
            }
          />
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <span className="hidden sm:inline">Start airing it out</span>
            <span className="sm:hidden">Get started</span>
          </Link>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:gap-8 sm:py-20">
        {/* Badge */}
        <span className="rounded-full border bg-secondary px-3 py-1 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          · Vent and Decompress
        </span>

        <h1 className="font-heading text-3xl font-light leading-tight tracking-wide text-foreground sm:text-5xl">
          A private space to get it out.
        </h1>
        <p className="max-w-lg text-base text-muted-foreground leading-relaxed sm:text-lg">
          Write what&apos;s on your mind, get a gentle reflection, and notice how you feel before
          and after. An unhurried sanctuary built for mental stillness.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex h-11 min-w-48 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start airing it out →
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 min-w-24 items-center justify-center rounded-lg px-6 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Log in
          </Link>
        </div>

        {/* Privacy badge */}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <LuLock className="h-3.5 w-3.5" aria-hidden />
          Only you can see this. No ads, no public feed, no streaks.
        </p>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="bg-secondary/40 px-4 py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Three-Stage Sequence
          </p>
          <h2 id="how-heading" className="mb-4 text-3xl font-light tracking-wide text-foreground">
            A quiet ritual to clear your mind.
          </h2>
          <p className="mb-12 text-muted-foreground">
            No dopamine loops, no social validation, and no judgment. Just a seamless, private
            rhythm to process what is spinning.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "Step 01",
                icon: <LuPenLine className="h-5 w-5" aria-hidden />,
                title: "Air It Out",
                subtitle: "Write freely, without judgment",
                body: "Type or record whatever is churning inside, without worry over punctuation or composure. Only the first 500 characters are kept as a note; the rest is processed and discarded.",
                note: "Zero external space sharing",
              },
              {
                step: "Step 02",
                icon: <LuSparkles className="h-5 w-5" aria-hidden />,
                title: "Decompress & Reframe",
                subtitle: "A gentle reflection on your words",
                body: "Receive an empathetic, objective perspective that mirrors your feelings back without lecturing, diagnosing, or telling you what you \u2018should\u2019 do.",
                note: "Neutral, grounding perspective",
              },
              {
                step: "Step 03",
                icon: <LuActivity className="h-5 w-5" aria-hidden />,
                title: "Track Your Reset",
                subtitle: "See how you feel before and after",
                body: "Check in with your nervous system on a 1-to-10 scale before writing and after reading. Voice notes work too, and a short AI chat is there if you would rather talk it through.",
                note: "Self-awareness, not metrics",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border bg-card p-6 shadow-sm text-left"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.step}
                </p>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  {item.icon}
                </div>
                <h3 className="mb-1 font-heading text-lg font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mb-2 text-sm font-medium text-primary">{item.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                <p className="mt-4 text-xs text-muted-foreground">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy Guarantee ───────────────────────────────────────── */}
      <section
        id="privacy"
        aria-labelledby="privacy-heading"
        className="px-4 py-20"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Plain-Language Privacy
              </p>
              <h2
                id="privacy-heading"
                className="text-2xl font-light tracking-wide text-foreground"
              >
                Here is exactly what happens to your words.
              </h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <LuShieldCheck className="h-3.5 w-3.5" aria-hidden />
              No analytics installed
            </span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <LuLock className="h-5 w-5" aria-hidden />,
                title: "What is stored",
                body: "Your email, mood scores, the emotion word, and the first 500 characters of each note. Full vent text, recordings, transcripts and chat are never saved. There is no end-to-end encryption.",
              },
              {
                icon: <LuTrash2 className="h-5 w-5" aria-hidden />,
                title: "Delete anytime",
                body: "Remove a single entry, or delete your account and every check-in with it. There is no archive and no recovery afterwards.",
              },
              {
                icon: <LuSparkles className="h-5 w-5" aria-hidden />,
                title: "You choose when AI sees it",
                body: "Reflections and chat replies only happen after you tick a disclosure naming the provider: DeepSeek for text and ElevenLabs for voice. Without consent, you still get static prompts.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                  {item.icon}
                </div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <LuSparkles className="h-6 w-6" aria-hidden />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-light tracking-wide text-foreground">
            Ready to take a breath?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Type whatever is weighing on you right now and feel the immediate release of putting
            words to paper.
          </p>
          <Link
            to="/register"
            className="inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Open the canvas →
          </Link>
        </div>
      </section>

      {/* ── Crisis strip ────────────────────────────────────────────── */}
      <section className="border-t bg-secondary/30 px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <LuShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">AirSpace isn&apos;t therapy or an emergency service.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              If you are navigating a severe mental health crisis, experiencing suicidal ideation,
              or need immediate intervention, compassionate and free clinical resources are available
              around the clock.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              In Nigeria, call <strong className="text-foreground">112</strong> (Lagos: 767). The
              resources list is loaded from the AirSpace API, including MANI, SURPIN and Lagos
              Lifeline.
            </p>
          </div>
          <CrisisDialog
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent">
                View Crisis Resources →
              </button>
            }
          />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        <p>© 2026 AirSpace. An unhurried sanctuary for your mind.</p>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>No analytics</span>
          <span>·</span>
          <span>Delete any time</span>
          <span>·</span>
          <span>Not a therapy service</span>
        </div>
      </footer>
    </div>
  )
}
