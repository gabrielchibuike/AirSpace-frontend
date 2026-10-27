import { LuSparkles } from "react-icons/lu"

export function AIReflection({ content }: { content: string }) {
  return (
    <aside
      aria-label="AI-generated reflection"
      className="rounded-xl border border-ai-border bg-ai p-5 text-ai-foreground"
    >
      <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
        <LuSparkles aria-hidden /> AI-generated reflection. Not advice or a diagnosis.
      </p>
      <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
    </aside>
  )
}
