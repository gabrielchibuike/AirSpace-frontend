import { useCallback, useEffect, useRef, useState } from "react"
import { LuMic, LuSquare, LuTrash2, LuTriangleAlert } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import type { CrisisResource } from "@/features/checkins/api"
import { getErrorMessage } from "@/lib/api/errors"
import { useVoiceVent } from "./hooks"

const MAX_SECONDS = 120

type Phase = "idle" | "recording" | "recorded"

interface Props {
  onTranscript: (text: string) => void
  onSafety: (notice: string, resources: CrisisResource[] | null) => void
  disabled?: boolean
  transcriptionEnabled: boolean | null
  capabilitiesError: boolean
  transcriptionProvider: string | null
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

/**
 * Records a short voice note in the browser and sends it to POST /vent/voice.
 * Nothing is uploaded until the user ticks the disclosure and presses Send.
 */
export function VoiceRecorder({
  onTranscript,
  onSafety,
  disabled,
  transcriptionEnabled,
  capabilitiesError,
  transcriptionProvider,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const voice = useVoiceVent()

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined"

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }, [])

  useEffect(() => teardown, [teardown])

  const startRecording = async () => {
    setError(null)
    setBlob(null)
    setSeconds(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        setBlob(recorded)
        setPhase("recorded")
        teardown()
      }

      recorder.start()
      setPhase("recording")
    } catch {
      setError("We couldn't reach your microphone. Check browser permissions, or type instead.")
      teardown()
    }
  }

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== "inactive") recorder.stop()
  }, [])

  // Hard stop at the cap so a forgotten tab cannot upload an hour of audio.
  useEffect(() => {
    if (phase !== "recording") return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase === "recording" && seconds >= MAX_SECONDS) stopRecording()
  }, [phase, seconds, stopRecording])

  const discard = () => {
    setBlob(null)
    setSeconds(0)
    setConsent(false)
    setPhase("idle")
    setError(null)
  }

  const send = () => {
    if (!blob) return
    setError(null)
    voice.mutate(
      { blob, options: { consent, reflect: false } },
      {
        onSuccess: (result) => {
          if (result.ai_status === "success" && result.transcript) {
            onTranscript(result.transcript)
            discard()
            return
          }
          if (result.ai_status === "skipped_for_safety") {
            onSafety(
              result.safety_notice ?? "It sounds like you may need human support right now.",
              result.crisis_resources,
            )
            discard()
            return
          }
          if (result.ai_status === "unavailable") {
            setError("Voice transcription isn't switched on for this server yet. Type instead — nothing is lost.")
            return
          }
          if (result.ai_status === "consent_required") {
            setError("Tick the disclosure below so we can send this recording for transcription.")
            return
          }
          setError("I couldn't catch that. Try again, a little closer to the mic, or type instead.")
        },
        onError: (e) => setError(getErrorMessage(e)),
      },
    )
  }

  if (!supported) {
    return (
      <p className="text-xs text-muted-foreground">
        This browser can&apos;t record audio. You can still type your entry.
      </p>
    )
  }

  if (transcriptionEnabled !== true) {
    const message =
      transcriptionEnabled === false
        ? "Voice transcription is not enabled on this server yet. You can still type your entry."
        : capabilitiesError
          ? "Voice availability could not be checked. You can still type your entry."
          : "Checking voice transcription availability…"
    return <p className="text-xs text-muted-foreground">{message}</p>
  }

  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <div className="space-y-3 rounded-xl border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {phase === "idle" && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={startRecording}
            disabled={disabled}
          >
            <LuMic className="h-4 w-4" aria-hidden />
            Record instead of typing
          </Button>
        )}

        {phase === "recording" && (
          <>
            <Button type="button" variant="destructive" size="sm" className="gap-1.5" onClick={stopRecording}>
              <LuSquare className="h-3.5 w-3.5" aria-hidden />
              Stop
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              Recording {elapsed} of 2:00
            </span>
          </>
        )}

        {phase === "recorded" && (
          <>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={send}
              disabled={!consent || voice.isPending}
            >
              <LuMic className="h-4 w-4" aria-hidden />
              {voice.isPending ? "Transcribing…" : "Transcribe this recording"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={discard}>
              <LuTrash2 className="h-4 w-4" aria-hidden />
              Discard
            </Button>
            <span className="text-xs text-muted-foreground">{elapsed} recorded</span>
          </>
        )}
      </div>

      {phase === "recorded" && (
        <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I consent to this recording being sent to{" "}
            {transcriptionProvider ? (
              <>
                <strong className="text-foreground">{transcriptionProvider}</strong>, an external provider
              </>
            ) : (
              "an external provider"
            )}{" "}
            for transcription. AirSpace does not keep the audio.
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 text-xs text-destructive">
          <LuTriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
