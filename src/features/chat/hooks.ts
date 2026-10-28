import { useMutation } from "@tanstack/react-query"
import { chatApi, type ChatRequest } from "./api"

export function useChatTurn() {
  return useMutation({
    mutationFn: (body: ChatRequest) => chatApi.send(body),
  })
}
