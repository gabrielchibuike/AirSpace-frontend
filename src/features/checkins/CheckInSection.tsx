import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MoodScale } from "./MoodScale"
import { useCheckIns, useCreateCheckIn } from "./hooks"

interface Props {
  sessionId: string
}

export function CheckInSection({ sessionId }: Props) {
  const { data: checkIns } = useCheckIns(sessionId)
  const createCheckIn = useCreateCheckIn()
  const [after, setAfter] = useState<number | null>(null)

  const beforeCheckIn = checkIns?.find((c) => c.stage === "before")
  const afterCheckIn = checkIns?.find((c) => c.stage === "after")

  // If after check-in already exists, show a summary
  if (afterCheckIn) {
    return (
      <section aria-labelledby="checkin-heading" className="space-y-3">
        <h2 id="checkin-heading" className="text-lg">How you felt</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {beforeCheckIn && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-muted-foreground">Before</p>
              <p className="mt-1 font-medium capitalize">{beforeCheckIn.value} / 5</p>
            </div>
          )}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground">After</p>
            <p className="mt-1 font-medium capitalize">{afterCheckIn.value} / 5</p>
          </div>
        </div>
      </section>
    )
  }

  function handleSave() {
    if (after === null) return
    createCheckIn.mutate(
      { sessionId, stage: "after", value: after },
      {
        onError: () =>
          toast.error("We couldn't save your mood check-in. Please try again."),
      }
    )
  }

  return (
    <section aria-labelledby="after-checkin-heading" className="space-y-4">
      <h2 id="after-checkin-heading" className="text-lg">How are you feeling now?</h2>
      <p className="text-sm text-muted-foreground">
        Compare how you feel after airing it out.
      </p>
      <MoodScale
        name="after"
        legend="How are you feeling now?"
        value={after}
        onChange={setAfter}
      />
      <Button onClick={handleSave} disabled={after === null || createCheckIn.isPending}>
        {createCheckIn.isPending ? "Saving…" : "Record how I feel now"}
      </Button>
    </section>
  )
}
