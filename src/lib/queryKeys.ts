export const qk = {
  me: ["me"] as const,
  capabilities: ["capabilities"] as const,
  // Check-ins are top-level (not scoped to a session in this API)
  checkIns: ["checkins"] as const,
  crisisResources: ["crisis-resources"] as const,
} as const
