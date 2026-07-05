import { describe, it, expect, vi } from 'vitest'
import { createStore } from './store.js'

describe('createStore', () => {
  it('returns initial state', () => {
    const store = createStore({ count: 0 })
    expect(store.getState()).toEqual({ count: 0 })
  })

  it('setState merges partial state', () => {
    const store = createStore({ a: 1, b: 2 })
    store.setState({ b: 3 })
    expect(store.getState()).toEqual({ a: 1, b: 3 })
  })

  it('setState accepts function updater', () => {
    const store = createStore({ count: 0 })
    store.setState(prev => ({ count: prev.count + 1 }))
    expect(store.getState().count).toBe(1)
  })

  it('subscribe notifies listeners on setState', () => {
    const store = createStore({ x: 1 })
    const fn = vi.fn()
    store.subscribe(fn)
    store.setState({ x: 2 })
    expect(fn).toHaveBeenCalledWith({ x: 2 })
  })

  it('unsubscribe stops notifications', () => {
    const store = createStore({ x: 1 })
    const fn = vi.fn()
    const unsub = store.subscribe(fn)
    unsub()
    store.setState({ x: 2 })
    expect(fn).not.toHaveBeenCalled()
  })

  it('multiple subscribers all receive updates', () => {
    const store = createStore({ x: 1 })
    const a = vi.fn()
    const b = vi.fn()
    store.subscribe(a)
    store.subscribe(b)
    store.setState({ x: 3 })
    expect(a).toHaveBeenCalledWith({ x: 3 })
    expect(b).toHaveBeenCalledWith({ x: 3 })
  })
})
