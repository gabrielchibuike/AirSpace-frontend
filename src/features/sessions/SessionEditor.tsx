import { LuLock } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const MAX = 10_000 // placeholder: align with the backend's limit

interface Props {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
}

export function SessionEditor({ value, onChange, onSave, isSaving }: Props) {
  const canSave = value.trim().length > 0 && !isSaving

  return (
    <div className="space-y-4">
      <Label htmlFor="entry" className="sr-only">Your entry</Label>
      <Textarea
        id="entry"
        value={value}
        maxLength={MAX}
        autoComplete="off"
        placeholder="Write whatever's on your mind. This is just for you."
        className="min-h-72 resize-y bg-card p-5 text-lg leading-relaxed"
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <LuLock aria-hidden /> Only you can see this
        </span>
        <span>{value.length.toLocaleString()} / {MAX.toLocaleString()}</span>
      </div>
      <Button size="lg" onClick={onSave} disabled={!canSave}>
        {isSaving ? "Saving…" : "Save"}
      </Button>
    </div>
  )
}
