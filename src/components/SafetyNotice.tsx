import type { CrisisResource } from "@/features/checkins/api"
import { useCrisisResources } from "@/features/vent/hooks"

interface Props {
  notice: string
  /** Resources returned with the safety response; falls back to the public list. */
  resources?: CrisisResource[] | null
}

/**
 * The safety screen. Per the API contract it takes over the page: no
 * reflection, no upsell, no cheerful copy — just the notice and real contacts.
 */
export function SafetyNotice({ notice, resources }: Props) {
  const { data: fallbackResources } = useCrisisResources()
  const list = resources && resources.length > 0 ? resources : (fallbackResources ?? [])

  return (
    <section
      role="alert"
      aria-labelledby="safety-heading"
      className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      <h2 id="safety-heading" className="text-base font-semibold">
        Please read this before going on
      </h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{notice}</p>

      <p className="mt-3 text-sm">
        If you are in immediate danger, call your local emergency number now. In Nigeria that is{" "}
        <a href="tel:112" className="font-semibold underline underline-offset-4">
          112
        </a>{" "}
        (Lagos: 767).
      </p>

      {list.length > 0 && (
        <ul className="mt-4 space-y-2">
          {list.map((resource) => (
            <li
              key={resource.name}
              className="rounded-xl border border-amber-300/70 bg-white/70 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-900/40"
            >
              <p className="font-medium">{resource.name}</p>
              {resource.description && <p className="text-xs opacity-90">{resource.description}</p>}
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <a href={`tel:${resource.phone.replace(/\s+/g, "")}`} className="font-semibold underline underline-offset-4">
                  Call {resource.phone}
                </a>
                {resource.alt_phone && <span>Alt: {resource.alt_phone}</span>}
                <span>{resource.hours}</span>
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    Website
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
