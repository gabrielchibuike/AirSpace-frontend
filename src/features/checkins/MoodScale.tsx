// Mood labels (1-5): Heavy, Low, Okay, Lighter, Calm
// Placeholder scale: confirm values with the backend
const MOODS = [
  { value: 1, label: "Heavy" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Lighter" },
  { value: 5, label: "Calm" },
]

export const moodLabel = (v: number) => MOODS.find((m) => m.value === v)?.label ?? ""

interface Props {
  name: string
  legend: string
  value: number | null
  onChange: (value: number) => void
}

export function MoodScale({ name, legend, value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="font-heading text-2xl">{legend}</legend>
      <div className="mt-4 grid grid-cols-5 gap-2">
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
            <span className="flex min-h-14 items-center justify-center rounded-2xl border border-input bg-card px-1 py-3 text-sm peer-checked:border-primary peer-checked:bg-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              {m.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
