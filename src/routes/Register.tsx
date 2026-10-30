import { Link } from "react-router-dom"
import { LuArrowLeft, LuShieldAlert, LuSmilePlus } from "react-icons/lu"
import { RegisterForm } from "@/features/auth"
import { CrisisDialog } from "@/components/CrisisDialog"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Auth nav */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-heading text-base font-semibold tracking-tight text-primary">
              AirSpace
            </span>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              Vent and Decompress
            </span>
          </Link>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
            <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <LuArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </Link>
            <CrisisDialog
              trigger={
                <button className="inline-flex items-center gap-1 text-[#B3261E] hover:underline">
                  <LuShieldAlert className="h-4 w-4" aria-hidden />
                  Need urgent help?
                </button>
              }
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Card */}
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm border">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <LuSmilePlus className="h-6 w-6" aria-hidden />
          </div>

          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Welcome to AirSpace
          </p>
          <h1 className="mb-2 text-center text-2xl font-light tracking-wide text-foreground">
            Create your private sanctuary.
          </h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            A quiet space to write freely, decompress, and reset without external noise.
          </p>

          <RegisterForm />

          {/* Privacy note */}
          <div className="mt-5 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">You decide what gets saved.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Scores and the first 500 characters of a note are stored in your account. Full vent
              text, recordings and chat are not.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Free · no ads · no analytics
        </p>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        AirSpace isn&apos;t therapy or an emergency service. In Nigeria call{" "}
        <a href="tel:112" className="font-semibold text-foreground">112</a>{" "}
        (Lagos: 767).
      </footer>
    </div>
  )
}
