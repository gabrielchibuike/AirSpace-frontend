import { useMutation } from "@tanstack/react-query"
import { AIReflection } from "@/components/AIReflection"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api/errors"
import { reflectionApi } from "./api"

export function ReflectionSection({ sessionId }: { sessionId: string }) {
  const reflect = useMutation({ mutationFn: () => reflectionApi.reflect(sessionId) })

  if (reflect.isSuccess) return <AIReflection content={reflect.data.content} />

  return (
    <section aria-live="polite" className="space-y-3">
      {reflect.isError && (
        <div role="alert" className="rounded-xl bg-muted p-4 text-sm">
          We couldn&apos;t generate a reflection right now. Your entry is saved and safe.
          <span className="mt-1 block text-muted-foreground">{getErrorMessage(reflect.error)}</span>
        </div>
      )}
      <Button variant="secondary" onClick={() => reflect.mutate()} disabled={reflect.isPending}>
        {reflect.isPending
          ? "Taking a thoughtful look…"
          : reflect.isError
            ? "Try again"
            : "Reflect on this"}
      </Button>
    </section>
  )
}
