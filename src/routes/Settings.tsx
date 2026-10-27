import { Separator } from "@/components/ui/separator"
import { DeleteAccountDialog } from "@/features/settings"

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-3xl">Settings</h1>

      <section aria-labelledby="account-heading" className="space-y-4">
        <h2 id="account-heading" className="text-xl">Account</h2>
        <Separator />
        <div className="space-y-2">
          <h3 className="font-medium">Delete account</h3>
          <p className="text-sm text-muted-foreground">
            Permanently remove your account and all associated data. This cannot be undone.
          </p>
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  )
}
