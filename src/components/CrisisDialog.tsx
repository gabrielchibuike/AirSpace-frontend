import type { ReactNode } from "react"
import { useState } from "react"
import { LuPhone, LuMessageSquare, LuGlobe, LuShieldAlert, LuX } from "react-icons/lu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCrisisResources } from "@/features/vent/hooks"

interface Props {
  trigger?: ReactNode
  defaultOpen?: boolean
}

export function CrisisDialog({ trigger, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const { data: resources, isPending } = useCrisisResources()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger className="font-medium underline underline-offset-4 hover:no-underline">
          If you&apos;re in distress, here are some resources.
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LuShieldAlert className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <DialogTitle className="text-lg">Need urgent help?</DialogTitle>
              <DialogDescription className="text-sm">
                Free, confidential support available 24/7
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Safety notice */}
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-foreground">
          AirSpace isn&apos;t therapy or an emergency service. If you&apos;re in immediate
          physical danger or thinking about harming yourself, please contact local emergency
          operators or a trained crisis listener right now.
        </div>

        {/* Resources */}
        {isPending && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {resources && resources.length > 0 && (
          <ul className="space-y-3" aria-label="Crisis resources">
            {resources.map((r) => (
              <li
                key={r.name}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {r.hours}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${r.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    <LuPhone className="h-3.5 w-3.5" aria-hidden />
                    {r.phone}
                  </a>
                  {r.alt_phone && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
                      <LuMessageSquare className="h-3.5 w-3.5" aria-hidden />
                      {r.alt_phone}
                    </span>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <LuGlobe className="h-3.5 w-3.5" aria-hidden />
                      Website
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Fallback when API hasn't loaded yet or returns nothing */}
        {!isPending && (!resources || resources.length === 0) && (
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-semibold">988 Lifeline:</span>{" "}
              <a href="tel:988" className="underline underline-offset-4">
                Call or text 988
              </a>{" "}
              (USA &amp; Canada)
            </li>
            <li>
              <span className="font-semibold">Crisis Text Line:</span> Text{" "}
              <strong>HOME</strong> to <strong>741741</strong>
            </li>
            <li>
              <span className="font-semibold">Samaritans:</span>{" "}
              <a href="tel:116123" className="underline underline-offset-4">
                116 123
              </a>{" "}
              (UK &amp; Ireland)
            </li>
            <li>
              <span className="font-semibold">Shout:</span> Text{" "}
              <strong>SHOUT</strong> to <strong>85258</strong> (UK)
            </li>
          </ul>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LuGlobe className="h-4 w-4" aria-hidden />
            You do not have to carry this alone.
          </p>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LuX className="h-4 w-4" aria-hidden />
            Dismiss
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
