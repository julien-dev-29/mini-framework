import { describe, it, expect, vi } from 'vitest'
import { createRouter } from './router.js'
import { h } from './h.js'

describe('createRouter', () => {
  it('renders initial route on #/', () => {
    window.location.hash = '#/'
    const outlet = document.createElement('div')
    const Home = () => h('h1', {}, 'Home')
    createRouter({ '#/': Home }, outlet)
    expect(outlet.children[0].tagName).toBe('H1')
    expect(outlet.children[0].textContent).toBe('Home')
  })

  it('navigate changes hash and triggers render', () => {
    window.location.hash = '#/'
    const outlet = document.createElement('div')
    const Home = () => h('h1', {}, 'Home')
    const About = () => h('h1', {}, 'About')
    const router = createRouter({
      '#/': Home,
      '#/about': About
    }, outlet)
    router.navigate('#/about')
    expect(outlet.children[0].textContent).toBe('About')
  })

  it('destroy prevents navigate from re-rendering', () => {
    window.location.hash = '#/'
    const outlet = document.createElement('div')
    const Home = () => h('h1', {}, 'Home')
    const About = () => h('h1', {}, 'About')
    const router = createRouter({
      '#/': Home,
      '#/about': About
    }, outlet)
    router.destroy()
    router.navigate('#/about')
    expect(outlet.children[0].textContent).toBe('Home')
  })

  it('renders fallback to #/ when route not found', () => {
    window.location.hash = '#/'
    const outlet = document.createElement('div')
    const Home = () => h('h1', {}, 'Home')
    createRouter({
      '#/': Home
    }, outlet)
    window.location.hash = '#/nonexistent'
    window.dispatchEvent(new Event('hashchange'))
    expect(outlet.children[0].textContent).toBe('Home')
  })
})
