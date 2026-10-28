// The API stores mood as an integer from 1 to 10 (before_score / after_score).
// The UI keeps the five named bands from the design, but every point on the
// scale is selectable so the number we send matches what the user picked.

export interface MoodBand {
  min: number
  max: number
  label: string
  sublabel: string
  icon: string
}

export const MOOD_BANDS: MoodBand[] = [
  { min: 1, max: 2, label: "Heavy", sublabel: "Dense fog or weight", icon: "💧" },
  { min: 3, max: 4, label: "Low", sublabel: "Tired, depleted", icon: "☁️" },
  { min: 5, max: 6, label: "Okay", sublabel: "Floating in the middle", icon: "—" },
  { min: 7, max: 8, label: "Lighter", sublabel: "A bit of breathing room", icon: "🌬️" },
  { min: 9, max: 10, label: "Calm", sublabel: "Centered and still", icon: "🌿" },
]

export const MOOD_MIN = 1
export const MOOD_MAX = 10

export const moodBand = (v: number) =>
  MOOD_BANDS.find((b) => v >= b.min && v <= b.max) ?? MOOD_BANDS[2]

export const moodLabel = (v: number) => moodBand(v).label
export const moodSublabel = (v: number) => moodBand(v).sublabel
export const moodIcon = (v: number) => moodBand(v).icon

const SCALE = Array.from({ length: MOOD_MAX - MOOD_MIN + 1 }, (_, i) => MOOD_MIN + i)

interface Props {
  name: string
  legend: string
  value: number | null
  onChange: (value: number) => void
  /** Compact variant used in cards and summaries */
  compact?: boolean
}

export function MoodScale({ name, legend, value, onChange, compact }: Props) {
  if (compact) {
    return (
      <fieldset>
        <legend className="sr-only">{legend}</legend>
        <div className="flex flex-wrap gap-1.5">
          {SCALE.map((score) => (
            <label key={score} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                className="peer sr-only"
                aria-label={`${score} of 10 — ${moodLabel(score)}`}
              />
              <span
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  value === score
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                ].join(" ")}
              >
                {score}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {SCALE.map((score) => (
          <label key={score} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={score}
              checked={value === score}
              onChange={() => onChange(score)}
              className="peer sr-only"
              aria-label={`${score} of 10 — ${moodLabel(score)}`}
            />
            <span
              className={[
                "flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-3 text-sm transition-all",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                value === score
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-input bg-card text-muted-foreground hover:border-ring hover:text-foreground",
              ].join(" ")}
            >
              <span className="text-lg font-light leading-none tabular-nums">{score}</span>
              <span className="text-[10px] leading-tight text-center">{moodBand(score).label}</span>
            </span>
          </label>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {value === null
          ? "1 is very heavy · 10 is calm"
          : `${value} of 10 · ${moodBand(value).label} — ${moodBand(value).sublabel}`}
      </p>
    </fieldset>
  )
}
