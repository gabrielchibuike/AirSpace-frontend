export const qk = {
  me: ["me"] as const,
  sessions: {
    all: ["sessions"] as const,
    detail: (id: string) => ["sessions", id] as const,
  },
  checkIns: (sessionId: string) => ["sessions", sessionId, "check-ins"] as const,
}
