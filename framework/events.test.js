import { describe, it, expect, vi } from 'vitest'
import { createEventBus } from './events.js'

describe('createEventBus', () => {
  it('on/emit calls the handler', () => {
    const bus = createEventBus()
    const fn = vi.fn()
    bus.on('test', fn)
    bus.emit('test', 'arg1', 'arg2')
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('off removes a handler', () => {
    const bus = createEventBus()
    const fn = vi.fn()
    bus.on('test', fn)
    bus.off('test', fn)
    bus.emit('test')
    expect(fn).not.toHaveBeenCalled()
  })

  it('on returns an unsubscribe function', () => {
    const bus = createEventBus()
    const fn = vi.fn()
    const unsub = bus.on('test', fn)
    unsub()
    bus.emit('test')
    expect(fn).not.toHaveBeenCalled()
  })

  it('multiple handlers for same event', () => {
    const bus = createEventBus()
    const a = vi.fn()
    const b = vi.fn()
    bus.on('test', a)
    bus.on('test', b)
    bus.emit('test', 'data')
    expect(a).toHaveBeenCalledWith('data')
    expect(b).toHaveBeenCalledWith('data')
  })

  it('does not call handlers for other events', () => {
    const bus = createEventBus()
    const fn = vi.fn()
    bus.on('a', fn)
    bus.emit('b')
    expect(fn).not.toHaveBeenCalled()
  })
})
