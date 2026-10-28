import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MoodScale } from "./MoodScale"
import { useCheckIns, useUpdateCheckIn } from "./hooks"

interface Props {
  checkinId: number
}

export function CheckInSection({ checkinId }: Props) {
  const { data: checkIns } = useCheckIns()
  const updateCheckIn = useUpdateCheckIn()
  const [after, setAfter] = useState<number | null>(null)

  const checkin = checkIns?.find((c) => c.id === checkinId)

  // If after check-in already exists, show a summary
  if (checkin?.after_score !== null && checkin?.after_score !== undefined) {
    return (
      <section aria-labelledby="checkin-heading" className="space-y-3">
        <h2 id="checkin-heading" className="text-lg">How you felt</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground">Before</p>
            <p className="mt-1 font-medium capitalize">{checkin.before_score} / 5</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground">After</p>
            <p className="mt-1 font-medium capitalize">{checkin.after_score} / 5</p>
          </div>
        </div>
      </section>
    )
  }

  function handleSave() {
    if (after === null) return
    updateCheckIn.mutate(
      { id: checkinId, body: { after_score: after } },
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
      <Button onClick={handleSave} disabled={after === null || updateCheckIn.isPending}>
        {updateCheckIn.isPending ? "Saving…" : "Record how I feel now"}
      </Button>
    </section>
  )
}
