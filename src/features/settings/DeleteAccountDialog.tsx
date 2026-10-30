import { useState } from "react"
import { toast } from "sonner"
import { LuTrash2, LuX } from "react-icons/lu"
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
      <DialogTrigger render={<Button variant="destructive" className="gap-1.5" />}>
        <LuTrash2 className="h-4 w-4" aria-hidden />
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
          <DialogClose render={<Button variant="ghost" className="gap-1.5" />}>
            <LuX className="h-4 w-4" aria-hidden />
            Cancel
          </DialogClose>
          <Button variant="destructive" className="gap-1.5" onClick={handleConfirm} disabled={isPending}>
            {!isPending && <LuTrash2 className="h-4 w-4" aria-hidden />}
            {isPending ? "Deleting…" : "Yes, delete everything"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
