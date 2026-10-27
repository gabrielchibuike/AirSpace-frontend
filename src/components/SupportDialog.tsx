import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SupportDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="font-medium underline underline-offset-4 hover:no-underline">
        If you&apos;re in distress, here are some resources.
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Support resources</DialogTitle>
          <DialogDescription>
            AirSpace is a journalling tool, not a substitute for professional care.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <span className="font-medium">Crisis Text Line: </span>
            Text HOME to 741741 (US, UK, Canada, Ireland)
          </li>
          <li>
            <span className="font-medium">Samaritans: </span>
            <a href="tel:116123" className="underline underline-offset-4">116 123</a> (UK &amp; Ireland)
          </li>
          <li>
            <span className="font-medium">988 Suicide &amp; Crisis Lifeline: </span>
            <a href="tel:988" className="underline underline-offset-4">Call or text 988</a> (US)
          </li>
          <li>
            <span className="font-medium">Shout: </span>
            Text SHOUT to 85258 (UK)
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          For medical emergencies, contact your local emergency services.
        </p>
      </DialogContent>
    </Dialog>
  )
}
