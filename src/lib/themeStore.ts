export type Theme = "light" | "dark"

const THEME_KEY = "airspace:theme"
const DARK_CLASS = "dark"

function getSystemPreference(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  } catch {
    return "light"
  }
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === "dark" || stored === "light") return stored
    return null
  } catch {
    return null
  }
}

function applyTheme(theme: Theme) {
  try {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add(DARK_CLASS)
    } else {
      root.classList.remove(DARK_CLASS)
    }
  } catch {
    // SSR or DOM unavailable
  }
}

function persist(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* storage unavailable */
  }
}

// Resolved theme: stored choice → system preference
let _current: Theme = readStored() ?? getSystemPreference()

// Apply on module load (before first paint)
applyTheme(_current)

// Listen for system theme changes if no stored preference
let _systemListener: MediaQueryList | null = null
try {
  _systemListener = window.matchMedia("(prefers-color-scheme: dark)")
} catch {
  /* unavailable */
}

export const themeStore = {
  get(): Theme {
    return _current
  },

  set(theme: Theme) {
    _current = theme
    applyTheme(theme)
    persist(theme)
    _listeners.forEach((fn) => fn(theme))
  },

  /** Stored explicitly by user, or auto-follows system */
  isExplicit(): boolean {
    return readStored() !== null
  },

  /** Reset to follow system preference */
  resetToSystem() {
    try {
      localStorage.removeItem(THEME_KEY)
    } catch {
      /* unavailable */
    }
    const sys = getSystemPreference()
    _current = sys
    applyTheme(sys)
    _listeners.forEach((fn) => fn(sys))
  },

  subscribe(fn: (theme: Theme) => void): () => void {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  },
}

const _listeners = new Set<(theme: Theme) => void>()

// Follow system if no explicit choice
if (_systemListener && !readStored()) {
  _systemListener.addEventListener("change", (e) => {
    if (!readStored()) {
      const sys: Theme = e.matches ? "dark" : "light"
      _current = sys
      applyTheme(sys)
      _listeners.forEach((fn) => fn(sys))
    }
  })
}
