export function createEventBus() {
  const handlers = new Map()

  return {
    on(event, fn) {
      if (!handlers.has(event)) {
        handlers.set(event, new Set())
      }
      handlers.get(event).add(fn)
      return () => this.off(event, fn)
    },

    off(event, fn) {
      const set = handlers.get(event)
      if (set) {
        set.delete(fn)
        if (set.size === 0) handlers.delete(event)
      }
    },

    emit(event, ...args) {
      const set = handlers.get(event)
      if (set) {
        for (const fn of set) {
          fn(...args)
        }
      }
    }
  }
}
