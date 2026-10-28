// Mood labels (1-5) matching the API schema (before_score / after_score: 1-10 integers,
// but the UX design uses a 5-point named scale mapped to 1-5).
// The design shows: Heavy, Low, Okay, Lighter, Calm

export const MOODS = [
  { value: 1, label: "Heavy", sublabel: "Dense fog or weight", icon: "💧" },
  { value: 2, label: "Low", sublabel: "Tired, depleted", icon: "☁️" },
  { value: 3, label: "Okay", sublabel: "Floating in middle", icon: "—" },
  { value: 4, label: "Lighter", sublabel: "A bit of breathing room", icon: "🌬️" },
  { value: 5, label: "Calm", sublabel: "Centered and still", icon: "🌿" },
] as const

export const moodLabel = (v: number) => MOODS.find((m) => m.value === v)?.label ?? `${v}/5`
export const moodSublabel = (v: number) => MOODS.find((m) => m.value === v)?.sublabel ?? ""

interface Props {
  name: string
  legend: string
  value: number | null
  onChange: (value: number) => void
  /** Compact variant used in session cards */
  compact?: boolean
}

export function MoodScale({ name, legend, value, onChange, compact }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={compact ? "flex flex-wrap gap-2" : "mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3"}>
        {MOODS.map((m) => (
          <label key={m.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={m.value}
              checked={value === m.value}
              onChange={() => onChange(m.value)}
              className="peer sr-only"
            />
            {compact ? (
              // Compact pill variant
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  value === m.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                ].join(" ")}
              >
                {m.label}
              </span>
            ) : (
              // Full card variant (design reference)
              <span
                className={[
                  "flex flex-col items-center gap-2 rounded-2xl border-2 px-1 py-4 text-sm transition-all",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                  value === m.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-input bg-card text-muted-foreground hover:border-ring hover:text-foreground",
                ].join(" ")}
              >
                {/* Icon circle */}
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full text-base transition-colors",
                    value === m.value ? "bg-primary text-primary-foreground" : "bg-muted",
                  ].join(" ")}
                  aria-hidden
                >
                  {m.icon}
                </span>
                <span className="font-medium leading-none">{m.label}</span>
                <span className="text-center text-[10px] leading-tight text-muted-foreground">
                  {m.sublabel}
                </span>
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
