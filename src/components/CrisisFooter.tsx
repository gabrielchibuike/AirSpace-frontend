import { CrisisDialog } from "@/components/CrisisDialog"
import { useCrisisResources } from "@/features/vent/hooks"
import { LuShieldAlert } from "react-icons/lu"

/**
 * One honest crisis strip for every page. The numbers come from the backend
 * (`GET /api/v1/crisis-resources`) instead of being hard-coded per screen.
 */
export function CrisisFooter() {
  const { data: resources } = useCrisisResources()
  const first = resources?.[0]
  const second = resources?.[1]

  return (
    <footer className="space-y-1 text-center text-xs text-muted-foreground">
      <p>AirSpace isn&apos;t therapy, isn&apos;t confidential, and isn&apos;t an emergency service.</p>
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {first ? (
          <span>
            <a href={`tel:${first.phone.replace(/\s+/g, "")}`} className="font-semibold text-foreground hover:underline">
              {first.phone}
            </a>{" "}
            {first.name}
          </span>
        ) : (
          <span>
            In Nigeria, call{" "}
            <a href="tel:112" className="font-semibold text-foreground hover:underline">
              112
            </a>
          </span>
        )}
        {second && (
          <>
            <span aria-hidden>·</span>
            <span>
              <a href={`tel:${second.phone.replace(/\s+/g, "")}`} className="font-semibold text-foreground hover:underline">
                {second.phone}
              </a>{" "}
              {second.name}
            </span>
          </>
        )}
      </p>
      <p>
        <CrisisDialog
          trigger={
            <button className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline">
              <LuShieldAlert className="h-3.5 w-3.5" aria-hidden />
              See all crisis resources
            </button>
          }
        />
      </p>
    </footer>
  )
}
