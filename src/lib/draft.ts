const KEY = "airspace:draft"

export const draftStore = {
  read: () => {
    try {
      return sessionStorage.getItem(KEY) ?? ""
    } catch {
      return ""
    }
  },
  write: (value: string) => {
    try {
      sessionStorage.setItem(KEY, value)
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* storage unavailable */
    }
  },
}
