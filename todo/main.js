import { h, patch, createStore } from '../framework/index.js'
import { App } from './components/App.js'

const store = createStore({ todos: [], filter: 'all' })
store.persist('todomvc-mini-framework')

function getFilter() {
  const hash = window.location.hash
  if (hash === '#/active') return 'active'
  if (hash === '#/completed') return 'completed'
  return 'all'
}

const outlet = document.getElementById('app')
let currentVNode = null

function render() {
  const state = store.getState()
  const filter = getFilter()
  const newVNode = h(App, { todos: state.todos, filter, store })
  patch(outlet, currentVNode, newVNode)
  currentVNode = newVNode
}

store.subscribe(render)
window.addEventListener('hashchange', render)
render()
