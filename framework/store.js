export function createStore(initialState = {}) {
  let state = { ...initialState }
  const listeners = new Set()
  let persistKey = null

  return {
    getState() {
      return state
    },

    setState(partial) {
      state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) }
      for (const fn of listeners) {
        fn(state)
      }
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(state))
        } catch (e) {}
      }
    },

    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },

    persist(key) {
      persistKey = key
      try {
        const saved = localStorage.getItem(key)
        if (saved) {
          const parsed = JSON.parse(saved)
          state = { ...state, ...parsed }
        }
      } catch (e) {}
      return state
    }
  }
}
