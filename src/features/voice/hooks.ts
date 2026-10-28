import { useMutation } from "@tanstack/react-query"
import { voiceApi, type VoiceVentOptions } from "./api"

export function useVoiceVent() {
  return useMutation({
    mutationFn: ({ blob, options }: { blob: Blob; options: VoiceVentOptions }) =>
      voiceApi.transcribe(blob, options),
  })
}
