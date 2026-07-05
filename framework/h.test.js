import { describe, it, expect } from 'vitest'
import { h } from './h.js'

describe('h()', () => {
  it('creates a VNode with tag, props, children', () => {
    const vnode = h('div', { class: 'foo' }, 'hello')
    expect(vnode).toEqual({
      tag: 'div',
      props: { class: 'foo' },
      children: ['hello']
    })
  })

  it('defaults props to empty object', () => {
    const vnode = h('span', null, 'text')
    expect(vnode.props).toEqual({})
  })

  it('converts non-object children to strings', () => {
    const vnode = h('p', {}, 42, true)
    expect(vnode.children).toEqual(['42', 'true'])
  })

  it('filters out null and false children', () => {
    const vnode = h('ul', {},
      h('li', {}, 'a'),
      null,
      false,
      h('li', {}, 'b')
    )
    expect(vnode.children).toHaveLength(2)
    expect(vnode.children[0].tag).toBe('li')
  })

  it('flattens nested children arrays', () => {
    const items = ['x', 'y']
    const vnode = h('ul', {}, ...items.map(i => h('li', {}, i)))
    expect(vnode.children).toHaveLength(2)
    expect(vnode.children[0].children[0]).toBe('x')
  })

  it('calls function tag with props', () => {
    const Component = ({ name, children }) =>
      h('div', { class: 'c' }, name, ...children)

    const vnode = h(Component, { name: 'test' }, h('span', {}))
    expect(vnode.tag).toBe('div')
    expect(vnode.props.class).toBe('c')
    expect(vnode.children[0]).toBe('test')
    expect(vnode.children[1].tag).toBe('span')
  })
})
