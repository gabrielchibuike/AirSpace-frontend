import type { ReactElement } from "react"
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
  trigger?: ReactElement
  defaultOpen?: boolean
}

export function CrisisDialog({ trigger, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const { data: resources, isPending } = useCrisisResources()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />

      ) : (
        <DialogTrigger className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 hover:no-underline">
          <LuShieldAlert className="h-4 w-4" aria-hidden />
          If you&apos;re in distress, here are some resources.
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LuShieldAlert className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
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
                    <p className="break-words font-semibold text-foreground">{r.name}</p>
                    <p className="break-words text-sm text-muted-foreground">{r.description}</p>
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

        {/* Fallback when the resources list hasn't loaded yet */}
        {!isPending && (!resources || resources.length === 0) && (
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-semibold">Emergency services:</span>{" "}
              <a href="tel:112" className="underline underline-offset-4">112</a> (Nigeria; Lagos: 767)
            </li>
            <li>
              <span className="font-semibold">MANI:</span>{" "}
              <a href="tel:08091116264" className="underline underline-offset-4">0809 111 6264</a>{" "}
              (24/7, free)
            </li>
            <li>
              <span className="font-semibold">SURPIN:</span>{" "}
              <a href="tel:08000787746" className="underline underline-offset-4">0800 078 7746</a>{" "}
              (24/7)
            </li>
            <li>
              <span className="font-semibold">Safe Place Nigeria:</span>{" "}
              <a href="tel:08008002000" className="underline underline-offset-4">0800 800 2000</a>{" "}
              (24/7, toll-free)
            </li>
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground">
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
