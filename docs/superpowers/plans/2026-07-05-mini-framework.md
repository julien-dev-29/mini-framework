# Mini-Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vanilla-JS mini-framework with Virtual DOM, routing, state management, and event handling, plus a TodoMVC demo app.

**Architecture:** Functional React-like patterns with `h()` VNode factory, diff/patch reconciliation, hash-based router, observable store, and custom event bus. Built with Vite for dev server.

**Tech Stack:** Vanilla JS, Vite

## Global Constraints

- No external framework/library dependencies (no React, Vue, Angular, etc.)
- Vite as the only dev dependency
- Framework files under `framework/` directory
- TodoMVC app under `todo/` directory
- All source files are `.js` (no TypeScript)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `todo/index.html`
- Create: `todo/styles/app.css` (empty)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mini-framework",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `todo/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TodoMVC</title>
  <link rel="stylesheet" href="styles/app.css" />
</head>
<body>
  <section class="todoapp" id="app"></section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
  </footer>
  <script type="module" src="main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create empty CSS placeholder**

`todo/styles/app.css` — empty file.

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules/` and `package-lock.json` created.

---

### Task 2: Framework — `h()` VNode Factory

**Files:**
- Create: `framework/h.js`

- [ ] **Step 1: Implement `framework/h.js`**

```js
export function h(tag, props, ...children) {
  if (typeof tag === 'function') {
    return tag({ ...props, children: children.flat() })
  }

  const flatChildren = children.flat(Infinity).filter(
    c => c != null && c !== false
  )

  return {
    tag,
    props: props || {},
    children: flatChildren.map(c =>
      typeof c === 'object' ? c : String(c)
    )
  }
}
```

`h()` handles two cases:
- **String tag** (e.g., `'div'`, `'span'`): creates a `{ tag, props, children }` VNode
- **Function tag** (component, e.g., `TodoItem`): calls the function with props, returns its VNode output directly

`children` are flattened (handles nested arrays from spreads like `...todos.map(...)`) and filtered (removes `null`/`false` for conditional rendering). Strings become text VNodes.

---

### Task 3: Framework — Virtual DOM (createElement + patch)

**Files:**
- Create: `framework/vdom.js`

**Consumes:** `h()` output (VNode objects)
**Produces:** `createElement(vnode)` → DOM node, `patch(parent, oldNode, newNode, index)`

- [ ] **Step 1: Implement `framework/vdom.js`**

```js
export function createElement(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }

  const el = document.createElement(vnode.tag)
  const props = vnode.props || {}

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase()
      el.addEventListener(eventType, value)
    } else if (key === 'className') {
      el.setAttribute('class', value)
    } else if (key === 'htmlFor') {
      el.setAttribute('for', value)
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value)
    } else if (key === 'checked' || key === 'disabled' || key === 'readonly' || key === 'autofocus') {
      if (value) el.setAttribute(key, '')
    } else if (value != null && value !== false) {
      el.setAttribute(key, String(value))
    }
  }

  if (vnode.children) {
    for (const child of vnode.children) {
      el.appendChild(createElement(child))
    }
  }

  return el
}

export function changed(a, b) {
  return typeof a !== typeof b || (typeof a === 'string' && a !== b) || a.tag !== b.tag
}

export function patch(parent, oldNode, newNode, index = 0) {
  if (!parent) return

  if (oldNode == null && newNode != null) {
    parent.appendChild(createElement(newNode))
    return
  }

  if (newNode == null && oldNode != null) {
    if (parent.childNodes[index]) {
      parent.removeChild(parent.childNodes[index])
    }
    return
  }

  if (changed(oldNode, newNode)) {
    const newEl = createElement(newNode)
    const oldEl = parent.childNodes[index]
    if (oldEl) {
      parent.replaceChild(newEl, oldEl)
    } else {
      parent.appendChild(newEl)
    }
    return
  }

  const el = parent.childNodes[index]
  if (!el) return

  if (typeof newNode === 'string') {
    if (el.textContent !== newNode) {
      el.textContent = newNode
    }
    return
  }

  const oldProps = oldNode.props || {}
  const newProps = newNode.props || {}

  for (const [key, value] of Object.entries(newProps)) {
    const oldValue = oldProps[key]
    if (value !== oldValue) {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventType = key.slice(2).toLowerCase()
        const oldHandler = oldProps[key]
        if (oldHandler) el.removeEventListener(eventType, oldHandler)
        el.addEventListener(eventType, value)
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value)
      } else if (key === 'checked' || key === 'disabled' || key === 'readonly') {
        if (value) el.setAttribute(key, '')
        else el.removeAttribute(key)
      } else if (value != null && value !== false) {
        el.setAttribute(key, String(value))
      } else {
        el.removeAttribute(key)
      }
    }
  }

  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase()
        el.removeEventListener(eventType, oldProps[key])
      } else {
        el.removeAttribute(key)
      }
    }
  }

  const oldChildren = oldNode.children || []
  const newChildren = newNode.children || []
  const len = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < len; i++) {
    patch(el, oldChildren[i], newChildren[i], i)
  }
}
```

Key behaviors:
- `createElement`: converts a VNode tree to real DOM. Event props (`onClick`, `onInput`, etc.) attach listeners directly.
- `changed`: detects if two VNodes represent different DOM structures (different types, different tags).
- `patch`: recursive diff. If nodes changed structurally → replace. If same tag → diff attributes and children. Handles add/remove of nodes and text content updates.

---

### Task 4: Framework — State Management

**Files:**
- Create: `framework/store.js`

- [ ] **Step 1: Implement `framework/store.js`**

```js
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
        } catch (e) { /* ignore quota errors */ }
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
      } catch (e) { /* ignore parse errors */ }
      return state
    }
  }
}
```

API:
- `getState()` — synchronous read of current state
- `setState(partial)` — shallow merge + notify all subscribers; accepts object or function `(prevState) => newState`
- `subscribe(fn)` — add change listener, returns unsubscribe function
- `persist(key)` — enable localStorage sync; hydrates on call, writes on every `setState`

---

### Task 5: Framework — Hash-Based Router

**Files:**
- Create: `framework/router.js`

**Consumes:** `patch` from `vdom.js`
**Produces:** `createRouter(routes, outlet)` → `{ navigate, destroy }`

- [ ] **Step 1: Implement `framework/router.js`**

```js
import { patch } from './vdom.js'

export function createRouter(routes, outlet) {
  let currentVNode = null

  function resolve() {
    const hash = window.location.hash || '#/'
    return routes[hash] || routes['#/'] || null
  }

  function render() {
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
      window.location.hash = path
    },
    destroy() {
      window.removeEventListener('hashchange', render)
    }
  }
}
```

Maps URL hash fragments to component functions. On hash change, resolves the route, calls the component, and patches the result into the outlet.

---

### Task 6: Framework — Event System

**Files:**
- Create: `framework/events.js`

```js
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
```

Pub/sub event bus for decoupled communication between components. Users call `events.on()` / `events.emit()` / `events.off()` instead of raw `addEventListener`.

---

### Task 7: Framework — Public API Barrel

**Files:**
- Create: `framework/index.js`

```js
export { h } from './h.js'
export { createElement, patch } from './vdom.js'
export { createStore } from './store.js'
export { createRouter } from './router.js'
export { createEventBus } from './events.js'
```

---

### Task 8: TodoMVC — Components

**Files:**
- Create: `todo/components/App.js`
- Create: `todo/components/Header.js`
- Create: `todo/components/TodoList.js`
- Create: `todo/components/TodoItem.js`
- Create: `todo/components/Footer.js`

**Pattern:** Every component is a function receiving a `props` object and returning a VNode. App defines action handlers (closures over `store`). Child components receive action callbacks as props.

- [ ] **Step 1: Create `todo/components/Header.js`**

```js
import { h } from '../../framework/index.js'

export function Header({ addTodo }) {
  function onKeydown(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addTodo(e.target.value.trim())
      e.target.value = ''
    }
  }

  return h('header', { class: 'header' },
    h('h1', {}, 'todos'),
    h('input', {
      class: 'new-todo',
      placeholder: 'What needs to be done?',
      autofocus: true,
      onKeydown
    })
  )
}
```

- [ ] **Step 2: Create `todo/components/TodoItem.js`**

```js
import { h } from '../../framework/index.js'

export function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  function onDblClick(e) {
    const li = e.target.closest('li')
    li.classList.add('editing')
    const input = li.querySelector('.edit')
    if (input) {
      input.value = todo.title
      input.focus()
    }
  }

  function onEditKeydown(e) {
    if (e.key === 'Enter') {
      finishEdit(e, todo.id)
    } else if (e.key === 'Escape') {
      cancelEdit(e)
    }
  }

  function finishEdit(e, id) {
    const val = e.target.value.trim()
    if (val) {
      onEdit(id, val)
    }
    e.target.closest('li').classList.remove('editing')
  }

  function cancelEdit(e) {
    e.target.closest('li').classList.remove('editing')
  }

  function onEditBlur(e) {
    finishEdit(e, todo.id)
  }

  return h('li', {
    class: todo.completed ? 'completed' : '',
    onDblClick
  },
    h('div', { class: 'view' },
      h('input', {
        class: 'toggle',
        type: 'checkbox',
        checked: todo.completed,
        onChange: () => onToggle(todo.id)
      }),
      h('label', {}, todo.title),
      h('button', {
        class: 'destroy',
        onClick: () => onDelete(todo.id)
      })
    ),
    h('input', {
      class: 'edit',
      onKeydown: onEditKeydown,
      onBlur: onEditBlur
    })
  )
}
```

- [ ] **Step 3: Create `todo/components/TodoList.js`**

```js
import { h } from '../../framework/index.js'
import { TodoItem } from './TodoItem.js'

export function TodoList({ todos, onToggle, onDelete, onEdit, onToggleAll }) {
  if (todos.length === 0) return h('section', { class: 'main' })

  const allCompleted = todos.every(t => t.completed)

  return h('section', { class: 'main' },
    h('input', {
      id: 'toggle-all',
      class: 'toggle-all',
      type: 'checkbox',
      checked: allCompleted,
      onChange: onToggleAll
    }),
    h('label', { htmlFor: 'toggle-all' }, 'Mark all as complete'),
    h('ul', { class: 'todo-list' },
      ...todos.map(todo =>
        h(TodoItem, { todo, onToggle, onDelete, onEdit })
      )
    )
  )
}
```

- [ ] **Step 4: Create `todo/components/Footer.js`**

```js
import { h } from '../../framework/index.js'

export function Footer({ todos, filter, clearCompleted }) {
  const remaining = todos.filter(t => !t.completed).length
  const completed = todos.filter(t => t.completed).length
  const items = ['all', 'active', 'completed']

  return h('footer', { class: 'footer' },
    h('span', { class: 'todo-count' },
      h('strong', {}, String(remaining)),
      ` ${remaining === 1 ? 'item' : 'items'} left`
    ),
    h('ul', { class: 'filters' },
      ...items.map(f =>
        h('li', {},
          h('a', {
            href: `#/${f === 'all' ? '' : f}`,
            class: filter === f ? 'selected' : ''
          }, f.charAt(0).toUpperCase() + f.slice(1))
        )
      )
    ),
    completed > 0
      ? h('button', { class: 'clear-completed', onClick: clearCompleted },
          'Clear completed'
        )
      : null
  )
}
```

- [ ] **Step 5: Create `todo/components/App.js`**

```js
import { h } from '../../framework/index.js'
import { Header } from './Header.js'
import { TodoList } from './TodoList.js'
import { Footer } from './Footer.js'

export function App({ todos, filter, store }) {
  function addTodo(title) {
    store.setState({
      todos: [...todos, { id: Date.now(), title, completed: false }]
    })
  }

  function onToggle(id) {
    store.setState({
      todos: todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    })
  }

  function onDelete(id) {
    store.setState({ todos: todos.filter(t => t.id !== id) })
  }

  function onEdit(id, title) {
    store.setState({
      todos: todos.map(t => t.id === id ? { ...t, title } : t)
    })
  }

  function onToggleAll() {
    const allCompleted = todos.every(t => t.completed)
    store.setState({
      todos: todos.map(t => ({ ...t, completed: !allCompleted }))
    })
  }

  function clearCompleted() {
    store.setState({ todos: todos.filter(t => !t.completed) })
  }

  const filteredTodos = filter === 'all'
    ? todos
    : todos.filter(t => filter === 'active' ? !t.completed : t.completed)

  return h('section', { class: 'todoapp' },
    h(Header, { addTodo }),
    h(TodoList, {
      todos: filteredTodos,
      onToggle, onDelete, onEdit, onToggleAll
    }),
    todos.length > 0
      ? h(Footer, { todos, filter, clearCompleted })
      : null
  )
}
```

---

### Task 9: TodoMVC — Main Entry Point

**Files:**
- Create: `todo/main.js`

```js
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
```

---

### Task 10: TodoMVC — CSS Styles

**Files:**
- Write: `todo/styles/app.css`

- [ ] **Step 1: Create `todo/styles/app.css`**

```css
html { font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4em; background: #f5f5f5; color: #111; min-width: 230px; max-width: 550px; margin: 0 auto; }
.todoapp { background: #fff; margin: 130px 0 40px; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,.2); }
.todoapp input::-webkit-input-placeholder { font-style: italic; font-weight: 300; color: #e6e6e6; }
.todoapp input::-moz-placeholder { font-style: italic; font-weight: 300; color: #e6e6e6; }
.todoapp input::input-placeholder { font-style: italic; font-weight: 300; color: #e6e6e6; }
h1 { position: absolute; top: -140px; width: 100%; font-size: 100px; font-weight: 100; text-align: center; color: rgba(175,47,47,.15); }
.new-todo { padding: 16px 16px 16px 60px; border: none; background: rgba(0,0,0,.003); box-shadow: inset 0 -2px 1px rgba(0,0,0,.03); width: 100%; font-size: 24px; line-height: 1.4em; box-sizing: border-box; }
.main { position: relative; z-index: 2; border-top: 1px solid #e6e6e6; }
.toggle-all { width: 1px; height: 1px; border: none; opacity: 0; position: absolute; right: 100%; bottom: 100%; }
.toggle-all + label { width: 60px; height: 34px; font-size: 0; position: absolute; top: -52px; left: -13px; transform: rotate(90deg); }
.toggle-all + label:before { content: '❯'; font-size: 22px; color: #e6e6e6; padding: 10px 27px; }
.toggle-all:checked + label:before { color: #737373; }
.todo-list { margin: 0; padding: 0; list-style: none; }
.todo-list li { position: relative; font-size: 24px; border-bottom: 1px solid #ededed; }
.todo-list li:last-child { border-bottom: none; }
.todo-list li .view { display: flex; align-items: center; }
.todo-list li .toggle { text-align: center; width: 40px; height: 40px; margin: auto 0; border: none; appearance: none; -webkit-appearance: none; }
.todo-list li .toggle:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='-10 -18 100 135'%3E%3Ccircle cx='50' cy='50' r='50' fill='none' stroke='%23ededed' stroke-width='3'/%3E%3C/svg%3E"); }
.todo-list li .toggle:checked:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='-10 -18 100 135'%3E%3Ccircle cx='50' cy='50' r='50' fill='none' stroke='%23bddad5' stroke-width='3'/%3E%3Cpath fill='%235dc2af' d='M72 25L42 71 27 56l-4 4 20 20 34-52z'/%3E%3C/svg%3E"); }
.todo-list li label { word-break: break-all; padding: 15px 15px 15px 0; display: block; line-height: 1.2; flex: 1; }
.todo-list li .destroy { display: none; width: 40px; height: 40px; font-size: 30px; color: #cc9a9a; border: none; background: none; cursor: pointer; }
.todo-list li .destroy:after { content: '×'; }
.todo-list li:hover .destroy { display: block; }
.todo-list li .destroy:hover { color: #af5b5e; }
.todo-list li .edit { display: none; position: absolute; width: calc(100% - 43px); padding: 12px 16px; margin: 0 0 0 43px; font-size: 24px; line-height: 1.4em; border: 1px solid #999; box-shadow: inset 0 -1px 5px rgba(0,0,0,.2); box-sizing: border-box; }
.todo-list li.editing { border-bottom: none; padding: 0; }
.todo-list li.editing .edit { display: block; }
.todo-list li.editing .view { display: none; }
.todo-list li.completed label { color: #d9d9d9; text-decoration: line-through; }
.footer { display: flex; align-items: center; padding: 10px 15px; height: 50px; color: #777; border-top: 1px solid #e6e6e6; box-sizing: border-box; }
.todo-count { flex: 1; }
.todo-count strong { font-weight: 300; }
.filters { margin: 0; padding: 0; list-style: none; display: flex; gap: 3px; }
.filters li { display: inline; }
.filters a { color: inherit; margin: 3px; padding: 3px 7px; text-decoration: none; border: 1px solid transparent; border-radius: 3px; }
.filters a:hover { border-color: rgba(175,47,47,.1); }
.filters a.selected { border-color: rgba(175,47,47,.2); }
.clear-completed { border: none; background: none; cursor: pointer; color: #777; }
.clear-completed:hover { text-decoration: underline; }
.info { margin: 65px auto 0; color: #bfbfbf; font-size: 12px; text-shadow: 0 1px 0 rgba(255,255,255,.5); text-align: center; }
```

**Note:** The SVG checkbox circles are inline URL-encoded to avoid external image files.

---

### Task 11: Documentation

**Files:**
- Create: `docs/framework.md`

User-facing documentation covering all framework features with code examples.

- [ ] **Step 1: Write `docs/framework.md`**

```markdown
# Mini-Framework

A lightweight vanilla-JS frontend framework built around Virtual DOM reconciliation,
hash-based routing, observable state management, and a custom event bus.

## Philosophy

A framework inverts control — your code doesn't call the framework, the framework calls
your code. You describe **what** to render as a function of state, and the framework
handles **when** and **how** to update the DOM efficiently.

## Quick Start

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script type="module">
    import { h, patch, createStore } from './framework/index.js'

    const store = createStore({ count: 0 })
    const outlet = document.getElementById('app')
    let currentVNode = null

    function App(state) {
      return h('div', {},
        h('h1', {}, 'Count: ' + state.count),
        h('button', { onClick: () => store.setState({ count: state.count + 1 }) }, '+')
      )
    }

    function render() {
      const newVNode = App(store.getState())
      patch(outlet, currentVNode, newVNode)
      currentVNode = newVNode
    }

    store.subscribe(render)
    render()
  </script>
</body>
</html>
```

## Creating Elements

Use the `h()` function (hyperscript) to create virtual DOM nodes:

```js
import { h } from './framework/index.js'

// Simple element
h('div', {}, 'Hello')

// Element with attributes
h('input', { type: 'text', placeholder: 'Name', class: 'input' })
```

### `h(tag, props, ...children)`

| Argument | Type | Description |
|----------|------|-------------|
| `tag` | string or function | HTML tag name or component function |
| `props` | object | Attributes, event handlers, and properties |
| `children` | any | Child VNodes, strings, or arrays |

### Supported Props

- **HTML attributes:** `class`, `id`, `type`, `placeholder`, `href`, `src`, etc.
- **Boolean attributes:** `checked`, `disabled`, `readonly`, `autofocus`
- **Special aliases:** `className` → `class`, `htmlFor` → `for`
- **Style object:** `style: { color: 'red', fontSize: '14px' }`
- **Event handlers:** `onClick`, `onInput`, `onKeydown`, `onChange`, `onSubmit`, `onDblClick` (any `on` + event name)

## Nesting Elements

Pass children as additional arguments or spread an array:

```js
// Direct children
h('ul', { class: 'list' },
  h('li', {}, 'Item 1'),
  h('li', {}, 'Item 2')
)

// Array of children (spread)
const items = ['A', 'B', 'C']
h('ul', {},
  ...items.map(item => h('li', {}, item))
)

// Conditional rendering (null/false are skipped)
h('div', {},
  isLoggedIn ? h('span', {}, 'Welcome') : null
)
```

## Components

Components are functions that receive props and return VNodes. They compose naturally with `h()` by passing the function as the tag:

```js
function Button({ label, onClick }) {
  return h('button', { class: 'btn', onClick }, label)
}

function Form() {
  return h('form', {},
    h(Button, { label: 'Save', onClick: () => save() })
  )
}
```

## Event Handling

### Declarative Events

Attach event handlers directly in `h()` props. Handlers are automatically
added and removed during DOM updates:

```js
h('button', {
  onClick: () => alert('Clicked!'),
  onMouseEnter: () => console.log('hover')
}, 'Click me')
```

This is different from raw `addEventListener()` — the framework manages
the listener lifecycle: old handlers are removed and new ones added during
patch cycles, preventing memory leaks.

### Custom Event Bus

For decoupled cross-component communication:

```js
import { createEventBus } from './framework/index.js'

const bus = createEventBus()

// Subscribe
const unsub = bus.on('user:login', (user) => {
  console.log('User logged in:', user)
})

// Emit
bus.emit('user:login', { name: 'Alice' })

// Unsubscribe
unsub()
```

## State Management

```js
import { createStore } from './framework/index.js'

const store = createStore({ todos: [], filter: 'all' })

store.getState()            // → { todos: [], filter: 'all' }
store.setState({ filter: 'active' })  // merges + notifies subscribers
store.subscribe(render)     // re-render on every state change

// With function updater
store.setState(prev => ({ count: prev.count + 1 }))
```

### Persistence

Sync state to localStorage:

```js
store.persist('my-app-state')  // hydrates on call, saves on every setState
```

## Routing

Hash-based routing that maps URL fragments to component functions:

```js
import { createRouter } from './framework/index.js'

const outlet = document.getElementById('app')

createRouter({
  '#/': HomePage,
  '#/about': AboutPage,
  '#/contact': ContactPage
}, outlet)
```

The router:
1. Renders the matching component on page load
2. Listens to `hashchange` and re-renders automatically
3. Patches only the changed parts of the DOM

Manual navigation:

```js
window.location.hash = '#/about'
```

## How the Virtual DOM Works

1. **Render phase:** `h()` builds a lightweight JS object tree (VNode) describing the desired DOM
2. **Diff phase:** `patch()` compares the new VNode tree against the previous one
3. **Patch phase:** Only the differences are applied to the real DOM

### Diff Rules

- Different tag types → replace the DOM node
- Same tag → update attributes, recurse into children
- Text VNode changed → update `textContent`
- Node removed → remove from DOM
- Node added → create and append

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Framework                      │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  h()    │  │ patch()  │  │ createStore()  │  │
│  │ (VNode) │  │ (DOM op) │  │ (state mgmt)  │  │
│  └────┬────┘  └────┬─────┘  └───────┬───────┘  │
│  ┌────┴────────────┴───────────────┐│           │
│  │       createEventBus()          ││           │
│  │       (pub/sub events)          ││           │
│  └─────────────────────────────────┘│           │
│  ┌──────────────────────────────────┘           │
│  │  createRouter()                              │
│  │  (hash-based routing)                        │
│  └─────────────────────────────────────────────┘
└─────────────────────────────────────────────────┘
         │
         ▼
Data flow: User Action → Handler → store.setState()
  → subscribers → render() → h() builds VNode
  → patch() diffs → minimal DOM update
```

## Folder Structure

```
project/
├── framework/            # Framework source
│   ├── index.js          # Public API
│   ├── h.js              # VNode factory
│   ├── vdom.js           # createElement + patch
│   ├── store.js          # State management
│   ├── router.js         # Hash-based routing
│   └── events.js         # Custom event bus
├── your-app/             # Your application
│   ├── index.html
│   ├── main.js
│   ├── components/
│   └── styles/
└── package.json
```
```

---

### Task 12: Verification

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Manual test checklist:
1. [ ] App loads without errors
2. [ ] Can add a todo by typing and pressing Enter
3. [ ] Can toggle a todo as completed (checkbox)
4. [ ] Can delete a todo (× button on hover)
5. [ ] Can double-click to edit a todo
6. [ ] Filter links work: All / Active / Completed (URL hash changes)
7. [ ] Clear completed button appears and works
8. [ ] Todo count updates correctly
9. [ ] Toggle all checkbox works
10. [ ] State persists on page reload (localStorage)
11. [ ] Router navigates correctly between hash routes
