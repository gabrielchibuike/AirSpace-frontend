import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border bg-card text-foreground shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-foreground",
          error: "border-destructive/30 bg-destructive/10 text-destructive",
          success: "border-primary/30",
        },
      }}
    />
  )
}
