# Mini-Framework Design

## Overview

A lightweight, vanilla-JS frontend framework implementing Virtual DOM reconciliation, hash-based routing, observable state management, and a custom event system. Uses Vite as a dev server with no additional framework dependencies.

## Architecture

### Project Structure

```
mini-framework/
├── framework/
│   ├── index.js         # Public API re-exports
│   ├── h.js             # h() — VNode factory
│   ├── vdom.js          # createElement, diff, patch
│   ├── store.js         # createStore — observable state
│   ├── router.js        # createRouter — hash-based routing
│   └── events.js        # createEventBus — custom event system
├── todo/
│   ├── index.html       # TodoMVC entry point
│   ├── main.js          # App bootstrap
│   ├── components/
│   │   ├── App.js       # Root component
│   │   ├── Header.js    # New todo input
│   │   ├── TodoList.js  # Filtered todo list
│   │   ├── TodoItem.js  # Single todo row
│   │   └── Footer.js    # Filters & clear completed
│   └── styles/
│       └── app.css      # TodoMVC styles
├── docs/
│   └── framework.md     # User-facing documentation
└── package.json          # Vite dev server config
```

## Virtual DOM

### VNode Factory — `h(tag, props, ...children)`

Creates a plain-object VNode:

```js
{
  tag: 'div',
  props: { class: 'todo', onClick: handler },
  children: [ /* VNodes or strings */ ]
}
```

- `props` is always an object (empty `{}` if none)
- `children` is always a flat array
- Text nodes are represented as strings within the children array

### Render — `createElement(vnode)`

Converts a VNode (or string) to a real DOM node:
- Strings → `document.createTextNode()`
- Tags → `document.createElement()` + set attributes via `setAttribute` + append children recursively
- Event props (keys starting with `on`) are stored as data attributes for delegation rather than via `addEventListener`

### Patch — `patch(parent, oldNode, newNode, index)`

Compares two VNode trees and applies minimal changes:
1. If `oldNode` is a string and differs from `newNode` (string), replace the text node
2. If tags differ, replace the entire DOM node
3. If same tag, diff attributes (add/remove/update) and recursively diff children
4. Use index-based comparison for children (simplified, no keys)

## State Management — `createStore(initialState)`

```js
const store = createStore({ todos: [], filter: 'all' })
```

- `store.getState()` — returns current state (shallow read)
- `store.setState(partial)` — merges partial into state, notifies subscribers
- `store.subscribe(fn)` — adds listener, returns unsubscribe function
- `store.persist(key)` — auto-syncs state to `localStorage` on change, hydrates on init

## Routing — `createRouter(routes, outlet)`

Hash-based routing that maps URL hash fragments to component functions:

```js
createRouter({
  '#/': App
  '#/active': App
  '#/completed': App
}, document.getElementById('root'))
```

- Listens to `hashchange` on `window`
- Calls the matched component function with current store state
- Returns an unsubscribe function (for cleanup)
- The component function returns a VNode tree that is patched into the outlet

## Event System — `createEventBus()`

A pub/sub event bus for decoupled communication:

```js
const events = createEventBus()
events.on('todo:created', handler)    // subscribe
events.emit('todo:created', data)     // publish
events.off('todo:created', handler)   // unsubscribe
```

### Declarative Event Binding

VNode props prefixed with `on` (e.g., `onClick`, `onInput`) are handled via event delegation:
- During `createElement`, event props are stored in a `data-events` attribute
- The root container attaches one delegated listener per event type
- On event trigger, the delegate reads the `data-events` attribute, matches the event type, and calls the handler

## Component Pattern

Components are pure functions that receive props and return VNodes:

```js
function TodoItem({ todo, onToggle }) {
  return h('li', {
    class: todo.completed ? 'completed' : '',
    onClick: () => onToggle(todo.id)
  }, todo.title)
}
```

Re-rendering is triggered by store subscribers calling a top-level render function that diffs against the previous VNode tree.

## TodoMVC Implementation

Standard TodoMVC with:
- Add todo (input + Enter key)
- Toggle todo (checkbox)
- Delete todo (button)
- Edit todo (double-click, inline editing)
- Clear completed
- Filter: All / Active / Completed (via hash routing)
- Toggle all
- Item count
- Persistence to localStorage

## Data Flow

```
User action → Event handler → store.setState() → subscribers → 
  render() → h() builds new VNode → patch() diffs & updates DOM
```

Route changes:
```
hashchange → router matches → component called with state → 
  render() → patch DOM
```
