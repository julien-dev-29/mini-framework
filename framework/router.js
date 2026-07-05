import { patch } from './vdom.js'

export function createRouter(routes, outlet) {
  let currentVNode = null
  let destroyed = false

  function resolve() {
    const hash = window.location.hash || '#/'
    return routes[hash] || routes['#/'] || null
  }

  function render() {
    if (destroyed) return
    const component = resolve()
    if (!component) return
    const newVNode = component()
    patch(outlet, currentVNode, newVNode)
    currentVNode = newVNode
  }

  window.addEventListener('hashchange', render)
  render()

  return {
    navigate(path) {
      if (destroyed) return
      window.location.hash = path
      render()
    },
    destroy() {
      destroyed = true
      window.removeEventListener('hashchange', render)
    }
  }
}
