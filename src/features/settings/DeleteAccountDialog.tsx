import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { clearPrivateCache } from "@/lib/queryClient"
import { settingsApi } from "./api"

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await settingsApi.deleteAccount()
      clearPrivateCache()
      // Redirect to landing — page refresh is simplest: no stale auth state can linger
      window.location.replace("/")
    } catch {
      toast.error("We couldn't delete your account. Please try again.")
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete my account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Your account, every check-in score, note and emotion word will be permanently
            deleted. Reflections were never stored. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose render={<Button variant="ghost" />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Yes, delete everything"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
