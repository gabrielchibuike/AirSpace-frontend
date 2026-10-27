import { format } from "date-fns"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { UserEntry } from "@/components/UserEntry"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckInSection } from "@/features/checkins"
import { ReflectionSection } from "@/features/reflection"
import { DeleteSessionButton, useSession } from "@/features/sessions"
import { getErrorMessage } from "@/lib/api/errors"

export default function SessionPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending, error } = useSession(id)

  if (isPending) return <Skeleton className="h-64 w-full rounded-xl" />
  // Another user's ID also returns 404, so it looks the same as "doesn't exist"
  if (error || !session) return <p role="alert">{getErrorMessage(error)}</p>

  return (
    <article className="space-y-8">
      <h1 className="text-3xl">{format(new Date(session.created_at), "d MMM yyyy, h:mm a")}</h1>
      <UserEntry content={session.content} />
      <ReflectionSection sessionId={session.id} />
      <CheckInSection sessionId={session.id} />
      <DeleteSessionButton
        sessionId={session.id}
        onDeleted={() => {
          toast.success("Session deleted")
          navigate("/sessions", { replace: true })
        }}
      />
    </article>
  )
}
