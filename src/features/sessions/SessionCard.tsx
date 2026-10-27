import { format } from "date-fns"
import { Link } from "react-router-dom"
import type { Session } from "./api"

export function SessionCard({ session }: { session: Session }) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="text-sm text-muted-foreground">
        {format(new Date(session.created_at), "d MMM yyyy, h:mm a")}
      </p>
      <p className="mt-2 line-clamp-2 break-words">{session.content}</p>
    </Link>
  )
}
