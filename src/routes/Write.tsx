import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MoodScale, useCreateCheckIn } from "@/features/checkins"
import { SessionEditor, useCreateSession, useDraft } from "@/features/sessions"
import { getErrorMessage } from "@/lib/api/errors"

export default function WritePage() {
  const navigate = useNavigate()
  const draft = useDraft()
  const createSession = useCreateSession()
  const createCheckIn = useCreateCheckIn()

  const [step, setStep] = useState<"before" | "write">("before")
  const [before, setBefore] = useState<number | null>(null)

  async function handleSave() {
    try {
      const session = await createSession.mutateAsync({ content: draft.value })
      draft.clear()
      if (before !== null) {
        createCheckIn.mutate(
          { sessionId: session.id, stage: "before", value: before },
          {
            onError: () =>
              toast.warning(
                "Your entry is saved, but we couldn't record how you felt before."
              ),
          }
        )
      }
      navigate(`/sessions/${session.id}`)
    } catch (e) {
      toast.error(getErrorMessage(e)) // text stays in the editor, nothing is lost
    }
  }

  if (step === "before") {
    return (
      <div className="space-y-6">
        <MoodScale
          name="before"
          legend="How are you feeling right now?"
          value={before}
          onChange={setBefore}
        />
        <div className="flex gap-3">
          <Button size="lg" disabled={before === null} onClick={() => setStep("write")}>
            Continue
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setStep("write")}>
            Skip for now
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SessionEditor
      value={draft.value}
      onChange={draft.update}
      onSave={handleSave}
      isSaving={createSession.isPending}
    />
  )
}
