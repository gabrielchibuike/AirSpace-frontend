export const qk = {
  me: ["me"] as const,
  // Check-ins are top-level (not scoped to a session in this API)
  checkIns: ["checkins"] as const,
  crisisResources: ["crisis-resources"] as const,
  sessions: {
    all: ["sessions"] as const,
    detail: (id: string) => ["sessions", id] as const,
  },
} as const
