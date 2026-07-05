import { describe, it, expect, vi } from 'vitest'
import { createElement, patch } from './vdom.js'
import { h } from './h.js'

function mount(vnode) {
  const el = createElement(vnode)
  document.body.appendChild(el)
  return el
}

describe('createElement', () => {
  it('creates a text node from string', () => {
    const node = createElement('hello')
    expect(node.nodeType).toBe(3)
    expect(node.textContent).toBe('hello')
  })

  it('creates element with correct tag', () => {
    const el = createElement(h('div', {}))
    expect(el.tagName).toBe('DIV')
  })

  it('sets attributes', () => {
    const el = createElement(h('input', { type: 'text', placeholder: 'Name' }))
    expect(el.getAttribute('type')).toBe('text')
    expect(el.getAttribute('placeholder')).toBe('Name')
  })

  it('sets boolean attributes', () => {
    const el = createElement(h('input', { disabled: true }))
    expect(el.getAttribute('disabled')).toBe('')
  })

  it('sets class via className alias', () => {
    const el = createElement(h('div', { className: 'foo bar' }))
    expect(el.getAttribute('class')).toBe('foo bar')
  })

  it('sets for via htmlFor alias', () => {
    const el = createElement(h('label', { htmlFor: 'input-id' }))
    expect(el.getAttribute('for')).toBe('input-id')
  })

  it('applies style object', () => {
    const el = createElement(h('div', { style: { color: 'red', fontSize: '14px' } }))
    expect(el.style.color).toBe('red')
    expect(el.style.fontSize).toBe('14px')
  })

  it('adds event listeners', () => {
    const fn = vi.fn()
    const el = createElement(h('button', { onClick: fn }))
    el.click()
    expect(fn).toHaveBeenCalled()
  })

  it('appends children recursively', () => {
    const vnode = h('ul', {},
      h('li', {}, 'a'),
      h('li', {}, 'b')
    )
    const el = mount(vnode)
    expect(el.children.length).toBe(2)
    expect(el.children[0].tagName).toBe('LI')
    expect(el.children[0].textContent).toBe('a')
  })
})

describe('patch', () => {
  it('appends new node when old is null', () => {
    const parent = document.createElement('div')
    patch(parent, null, h('span', {}, 'new'))
    expect(parent.children.length).toBe(1)
    expect(parent.children[0].textContent).toBe('new')
  })

  it('removes node when new is null', () => {
    const parent = document.createElement('div')
    const old = createElement(h('span', {}, 'gone'))
    parent.appendChild(old)
    patch(parent, h('span', {}, 'gone'), null, 0)
    expect(parent.children.length).toBe(0)
  })

  it('replaces node when tag changes', () => {
    const parent = document.createElement('div')
    const old = createElement(h('span', {}))
    parent.appendChild(old)
    patch(parent, h('span', {}), h('div', {}), 0)
    expect(parent.children[0].tagName).toBe('DIV')
  })

  it('updates text content when string changes', () => {
    const parent = document.createElement('div')
    const old = createElement('old')
    parent.appendChild(old)
    patch(parent, 'old', 'new', 0)
    expect(parent.textContent).toBe('new')
  })

  it('updates attributes', () => {
    const parent = document.createElement('div')
    const old = createElement(h('input', { type: 'text' }))
    parent.appendChild(old)
    patch(parent,
      h('input', { type: 'text' }),
      h('input', { type: 'password' }),
      0
    )
    expect(parent.children[0].getAttribute('type')).toBe('password')
  })

  it('removes old attributes', () => {
    const parent = document.createElement('div')
    const old = createElement(h('input', { placeholder: 'old' }))
    parent.appendChild(old)
    patch(parent,
      h('input', { placeholder: 'old' }),
      h('input', {}),
      0
    )
    expect(parent.children[0].hasAttribute('placeholder')).toBe(false)
  })

  it('updates event handlers (removes old, adds new)', () => {
    const parent = document.createElement('div')
    const oldFn = vi.fn()
    const newFn = vi.fn()
    const old = createElement(h('button', { onClick: oldFn }))
    parent.appendChild(old)

    const oldVNode = h('button', { onClick: oldFn })
    const newVNode = h('button', { onClick: newFn })
    patch(parent, oldVNode, newVNode, 0)

    parent.children[0].click()
    expect(oldFn).not.toHaveBeenCalled()
    expect(newFn).toHaveBeenCalled()
  })

  it('recursively patches children', () => {
    const parent = document.createElement('div')
    const oldVNode = h('ul', {},
      h('li', {}, 'a'),
      h('li', {}, 'b')
    )
    const newVNode = h('ul', {},
      h('li', {}, 'x'),
      h('li', {}, 'y')
    )
    const old = createElement(oldVNode)
    parent.appendChild(old)
    patch(parent, oldVNode, newVNode, 0)
    expect(parent.children[0].children[0].textContent).toBe('x')
    expect(parent.children[0].children[1].textContent).toBe('y')
  })
})
