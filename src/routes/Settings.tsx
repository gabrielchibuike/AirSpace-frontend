import { format } from "date-fns"
import {
  LuCircleUserRound,
  LuShieldCheck,
  LuSun,
  LuMoon,
  LuMonitor,
  LuCheck,
  LuLogOut,
} from "react-icons/lu"
import { Separator } from "@/components/ui/separator"
import { DeleteAccountDialog } from "@/features/settings"
import { useMe, useLogout } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { useCheckIns } from "@/features/checkins"
import { useTheme } from "@/lib/useTheme"
import type { Theme } from "@/lib/themeStore"

const THEMES: {
  value: Theme
  label: string
  icon: React.ReactNode
  description: string
  preview: "light" | "dark"
}[] = [
  {
    value: "light",
    label: "Sanctuary Sun",
    icon: <LuSun className="h-4 w-4" aria-hidden />,
    description: "Warm off-white background with soft daylight contrast for daytime clarity.",
    preview: "light",
  },
  {
    value: "dark",
    label: "Quiet Night",
    icon: <LuMoon className="h-4 w-4" aria-hidden />,
    description: "Deep Navy canvas to reduce harsh glare during late-night decompression sessions.",
    preview: "dark",
  },
]

export default function SettingsPage() {
  const { data: user } = useMe()
  const logout = useLogout()
  const { data: checkins } = useCheckIns()
  const { theme, setTheme, resetToSystem, isExplicit } = useTheme()

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "?"
  const joined = user?.created_at
    ? format(new Date(user.created_at), "MMMM yyyy")
    : "—"

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Preferences &amp; Privacy
        </p>
        <h1 className="text-3xl font-light tracking-wide text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control your personal sanctuary and privacy boundaries at your own unhurried pace.
        </p>
      </div>

      {/* ── Account card ────────────────────────────────────────────── */}
      <section
        aria-labelledby="account-heading"
        className="rounded-2xl border bg-card p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuCircleUserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
            <div>
              <h2 id="account-heading" className="font-medium text-foreground text-sm">
                Account
              </h2>
              <p className="text-xs text-muted-foreground">Identity &amp; credentials</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            <LuShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Signed in
          </span>
        </div>

        <Separator />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground text-sm">{user?.email ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              Joined {joined}
              {checkins !== undefined && (
                <>
                  {" "}· {checkins.length} {checkins.length === 1 ? "entry" : "entries"}
                </>
              )}
            </p>
          </div>
        </div>

        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          You stay signed in for up to 7 days. The API has no refresh or server-side logout, so
          logging out here clears the token on this browser only.
        </p>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 sm:w-auto"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {!logout.isPending && <LuLogOut className="h-4 w-4" aria-hidden />}
          {logout.isPending ? "Logging out…" : "Log out of AirSpace"}
        </Button>
      </section>

      {/* ── Appearance ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="appearance-heading"
        className="rounded-2xl border bg-card p-5 shadow-sm space-y-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="appearance-heading" className="font-medium text-foreground text-sm">
              Appearance
            </h2>
            <p className="text-xs text-muted-foreground">Visual atmosphere and readability</p>
          </div>
          <button
            type="button"
            onClick={resetToSystem}
            className={[
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              !isExplicit
                ? "bg-secondary text-secondary-foreground border-border"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            title="Follow system preference"
          >
            <LuMonitor className="h-3.5 w-3.5" aria-hidden />
            Auto-adjust
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEMES.map((t) => {
            const isSelected = theme === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTheme(t.value)}
                className={[
                  "relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-muted/40 hover:border-ring hover:bg-muted/60",
                ].join(" ")}
              >
                {/* Check mark */}
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <LuCheck className="h-3 w-3" aria-hidden />
                  </span>
                )}

                {/* Mini preview of the theme */}
                <div
                  className={[
                    "h-16 w-full rounded-lg border overflow-hidden",
                    t.preview === "dark" ? "bg-[#0E1438]" : "bg-[#F6F3EF]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "m-2 space-y-1.5",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-1.5 w-16 rounded-full",
                        t.preview === "dark" ? "bg-[#B5C7E6]/50" : "bg-[#CBD8EE]",
                      ].join(" ")}
                    />
                    <div
                      className={[
                        "h-1.5 w-10 rounded-full",
                        t.preview === "dark" ? "bg-[#B5C7E6]/30" : "bg-[#DCE5F3]",
                      ].join(" ")}
                    />
                    <div
                      className={[
                        "mt-2 h-6 w-full rounded",
                        t.preview === "dark" ? "bg-[#172055]" : "bg-white",
                      ].join(" ")}
                    />
                  </div>
                </div>

                {/* Label */}
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {t.icon}
                  </span>
                  <span className="font-medium text-sm text-foreground">{t.label}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </button>
            )
          })}
        </div>

        {theme === "dark" && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <LuMoon className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" aria-hidden />
            Quiet Night softens ocular tension. Reflections glow subtly in pale twilight hues.
          </p>
        )}
      </section>

      {/* ── Privacy & data card ──────────────────────────────────────── */}
      <section
        aria-labelledby="privacy-heading"
        className="rounded-2xl border bg-card p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              What the API actually does
            </p>
            <h2 id="privacy-heading" className="font-medium text-foreground text-sm">
              Privacy &amp; data
            </h2>
          </div>
          <span className="rounded-full border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            No end-to-end encryption
          </span>
        </div>

        <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground space-y-2">
          <p className="font-medium">What is stored, what isn&apos;t, and how to delete it</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Stored:</strong> your email, mood scores (1–10),
              the emotion word, and the first 500 characters of each note.
            </li>
            <li>
              <strong className="text-foreground">Not stored:</strong> full vent text, voice
              recordings, transcripts, chat history, and reflections. These are processed in memory
              and discarded.
            </li>
            <li>
              <strong className="text-foreground">Third parties:</strong> when you consent, chat goes
              to Groq, reflections go to DeepSeek, and voice recordings go to ElevenLabs. The app has
              no analytics or error tracking installed.
            </li>
          </ul>
        </div>

        <div className="grid gap-2 text-center text-xs text-muted-foreground sm:grid-cols-3">
          {[
            "Stored: scores, notes, email",
            "Not stored: full vents, audio, chat",
            "Delete everything in one step",
          ].map((item) => (
            <div key={item} className="flex flex-col items-center gap-1.5 rounded-lg bg-muted p-2">
              <LuShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              <span className="leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Danger zone ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="danger-heading"
        className="rounded-2xl border border-destructive/30 bg-card p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 id="danger-heading" className="font-medium text-destructive text-sm">
            ⚠ Danger Zone
          </h2>
          <span className="text-xs text-destructive/70">No recovery possible</span>
        </div>

        <Separator className="bg-destructive/20" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm">
              Delete my account and all data
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Permanently deletes your account, every entry and its note from the server. The API
              asks for no password confirmation, so this dialog is the only guard.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </section>

    </div>
  )
}
