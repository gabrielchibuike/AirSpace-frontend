import type { Session } from "./api"

export const sortNewestFirst = (sessions: Session[]) =>
  [...sessions].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
