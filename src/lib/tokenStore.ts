const TOKEN_KEY = "airspace:token"

// In-memory token, seeded from sessionStorage on boot.
// sessionStorage survives page reloads but not new tabs or browser close.
let _token: string | null = null

function readFromStorage(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToStorage(t: string | null) {
  try {
    if (t) {
      sessionStorage.setItem(TOKEN_KEY, t)
    } else {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    /* storage unavailable */
  }
}

// Initialise from storage when the module is first imported
_token = readFromStorage()

export const tokenStore = {
  get: () => _token,
  set: (t: string) => {
    _token = t
    writeToStorage(t)
  },
  clear: () => {
    _token = null
    writeToStorage(null)
  },
}
