import type { PromptStyle } from "@/features/vent/api"

export const PROMPT_STYLES: { value: PromptStyle; label: string; description: string }[] = [
  { value: "gentle", label: "Gentle", description: "Warm, non-judgmental reflection." },
  { value: "practical", label: "Practical", description: "One or two small, optional next steps." },
  { value: "reflective", label: "Reflective", description: "Questions that help you name what you feel." },
]

interface Props {
  value: PromptStyle
  onChange: (style: PromptStyle) => void
  disabled?: boolean
}

export function PromptStyleSelect({ value, onChange, disabled }: Props) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Tone of the reflection
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {PROMPT_STYLES.map((style) => (
          <label key={style.value} className="cursor-pointer">
            <input
              type="radio"
              name="prompt-style"
              value={style.value}
              checked={value === style.value}
              onChange={() => onChange(style.value)}
              className="peer sr-only"
            />
            <span
              className={[
                "flex h-full flex-col gap-1 rounded-xl border-2 px-3 py-2 text-sm transition-colors",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                value === style.value
                  ? "border-primary bg-primary/10"
                  : "border-input bg-card hover:border-ring",
              ].join(" ")}
            >
              <span className="font-medium text-foreground">{style.label}</span>
              <span className="text-xs text-muted-foreground">{style.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
