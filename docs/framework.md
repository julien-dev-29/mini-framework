# Mini-Framework

A lightweight vanilla-JS frontend framework built around Virtual DOM reconciliation, hash-based routing, observable state management, and a custom event bus.

## Philosophy

A framework inverts control — your code doesn't call the framework, the framework calls your code. You describe **what** to render as a function of state, and the framework handles **when** and **how** to update the DOM efficiently.

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
| `tag` | string or function | HTML tag name, or a component function |
| `props` | object | Attributes, event handlers, and DOM properties |
| `children` | any | Child VNodes, text strings, or arrays (spread with `...`) |

### Supported Props

- **HTML attributes:** `class`, `id`, `type`, `placeholder`, `href`, `src`, etc.
- **Boolean attributes:** `checked`, `disabled`, `readonly`, `autofocus` — set to `true` to add, `false` to omit
- **Special aliases:** `className` maps to `class`, `htmlFor` maps to `for`
- **Inline styles:** `style: { color: 'red', fontSize: '14px' }` — uses camelCase keys, applied via `Object.assign(el.style, ...)`
- **Event handlers:** Any prop starting with `on` followed by an event name (e.g. `onClick`, `onInput`, `onKeydown`, `onChange`, `onSubmit`, `onDblClick`)

## Nesting Elements

Pass children as additional arguments or spread an array:

```js
// Direct children
h('ul', { class: 'list' },
  h('li', {}, 'Item 1'),
  h('li', {}, 'Item 2')
)

// Array of children (use spread)
const items = ['A', 'B', 'C']
h('ul', {},
  ...items.map(item => h('li', {}, item))
)

// Conditional rendering — null and false are skipped
h('div', {},
  isLoggedIn ? h('span', {}, 'Welcome') : null
)
```

## Components

Components are functions that receive props and return VNodes. They compose naturally by passing the function as the tag argument:

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

When `h()` receives a function as the tag, it calls it with the props object and returns the resulting VNode directly, allowing seamless nesting.

## Event Handling

### Declarative Events

Attach event handlers directly in `h()` props:

```js
h('button', {
  onClick: () => alert('Clicked!'),
  onMouseEnter: () => console.log('hover')
}, 'Click me')
```

The framework manages listener lifecycle — old handlers are automatically removed and new ones added during patch cycles, preventing memory leaks without manual cleanup.

### Custom Event Bus

For decoupled cross-component communication, use `createEventBus`:

```js
import { createEventBus } from './framework/index.js'

const bus = createEventBus()

// Subscribe
const unsub = bus.on('user:login', (user) => {
  console.log('User logged in:', user)
})

// Publish
bus.emit('user:login', { name: 'Alice' })

// Unsubscribe (returns the unsubscribe function)
unsub()

// Or use .off()
bus.off('user:login', handler)
```

## State Management

The store is a centralized observable state container:

```js
import { createStore } from './framework/index.js'

const store = createStore({ todos: [], filter: 'all' })

store.getState()
// → { todos: [], filter: 'all' }

store.setState({ filter: 'active' })
// merges partial state and notifies all subscribers

// With function updater (receives previous state)
store.setState(prev => ({ count: prev.count + 1 }))
```

### Subscribing to Changes

```js
const unsub = store.subscribe((state) => {
  console.log('State changed:', state)
})

// Later: unsubscribe
unsub()
```

### Persistence

Sync state to localStorage automatically:

```js
store.persist('my-app-key')
// Hydrates from localStorage on call
// Writes to localStorage on every setState
```

## Routing

Hash-based routing maps URL fragments to component functions:

```js
import { createRouter } from './framework/index.js'

const outlet = document.getElementById('app')

const router = createRouter({
  '#/': HomePage,
  '#/about': AboutPage,
  '#/contact': ContactPage
}, outlet)
```

The router renders the matching component on load and re-renders on every `hashchange` event. It patches only the changed parts of the DOM.

```js
// Navigate programmatically
window.location.hash = '#/about'

// Or using returned API
router.navigate('#/about')

// Cleanup
router.destroy()
```

## How the Virtual DOM Works

1. **Render phase:** `h()` builds a plain JS object tree (VNode) describing the desired DOM
2. **Diff phase:** `patch()` compares the new VNode tree against the previous one
3. **Patch phase:** Only the differences are applied to the real DOM

### Diff Rules

| Condition | Action |
|-----------|--------|
| Different types (string vs object) | Replace DOM node |
| Same tag, different attributes | Update/add/remove attributes |
| Text content changed | Update `textContent` |
| Node removed (new is null) | Remove from DOM |
| Node added (old is null) | Create and append |
| Same tag, same attrs | Recurse into children |

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                    Framework                       │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐ │
│  │  h()     │  │ patch()   │  │ createStore()  │ │
│  │ (VNode)  │  │ (DOM op)  │  │ (state mgmt)   │ │
│  └────┬─────┘  └─────┬─────┘  └───────┬────────┘ │
│  ┌────┴──────────────┴────────────────┐│          │
│  │        createEventBus()             ││          │
│  │        (pub/sub events)             ││          │
│  └────────────────────────────────────┘│          │
│  ┌─────────────────────────────────────┘          │
│  │  createRouter()                                │
│  │  (hash-based routing)                          │
│  └───────────────────────────────────────────────┘
└──────────────────────────────────────────────────┘

Data flow:
  User Action → Handler → store.setState()
    → subscribers → render() → h() builds VNode
    → patch() diffs → minimal DOM update
```

## Project Structure

```
project/
├── framework/            # Framework source
│   ├── index.js          # Public API barrel
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
