export function UserEntry({ content }: { content: string }) {
  return (
    <section
      aria-label="Your words"
      className="rounded-xl border-l-4 border-user-rule bg-card p-5 shadow-sm"
    >
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Your words</p>
      <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{content}</p>
    </section>
  )
}
