import { describe, it, expect, vi } from 'vitest'
import { h } from '../../framework/index.js'
import { createElement, patch } from '../../framework/vdom.js'
import { Header } from './Header.js'
import { TodoItem } from './TodoItem.js'
import { TodoList } from './TodoList.js'
import { Footer } from './Footer.js'
import { App } from './App.js'

function render(vnode) {
  const el = createElement(vnode)
  document.body.appendChild(el)
  return el
}

describe('Header', () => {
  it('renders title and input', () => {
    const el = render(h(Header, { addTodo: () => {} }))
    expect(el.querySelector('h1').textContent).toBe('todos')
    expect(el.querySelector('.new-todo')).toBeTruthy()
  })

  it('calls addTodo on Enter with trimmed value', () => {
    const addTodo = vi.fn()
    const el = render(h(Header, { addTodo }))
    const input = el.querySelector('.new-todo')
    input.value = '  New Task  '
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    input.dispatchEvent(event)
    expect(addTodo).toHaveBeenCalledWith('New Task')
    expect(input.value).toBe('')
  })

  it('does not call addTodo on other keys', () => {
    const addTodo = vi.fn()
    const el = render(h(Header, { addTodo }))
    const input = el.querySelector('.new-todo')
    input.value = 'test'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(addTodo).not.toHaveBeenCalled()
  })

  it('does not call addTodo on empty input', () => {
    const addTodo = vi.fn()
    const el = render(h(Header, { addTodo }))
    const input = el.querySelector('.new-todo')
    input.value = '   '
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(addTodo).not.toHaveBeenCalled()
  })
})

describe('TodoItem', () => {
  const todo = { id: 1, title: 'Test Todo', completed: false }

  it('renders todo title', () => {
    const el = render(h(TodoItem, { todo, onToggle: () => {}, onDelete: () => {}, onEdit: () => {} }))
    expect(el.querySelector('label').textContent).toBe('Test Todo')
  })

  it('adds completed class when todo is done', () => {
    const done = { id: 1, title: 'Done', completed: true }
    const el = render(h(TodoItem, { todo: done, onToggle: () => {}, onDelete: () => {}, onEdit: () => {} }))
    expect(el.className).toContain('completed')
  })

  it('calls onToggle when checkbox changes', () => {
    const onToggle = vi.fn()
    const el = render(h(TodoItem, { todo, onToggle, onDelete: () => {}, onEdit: () => {} }))
    el.querySelector('.toggle').click()
    expect(onToggle).toHaveBeenCalledWith(1)
  })

  it('calls onDelete when destroy button clicked', () => {
    const onDelete = vi.fn()
    const el = render(h(TodoItem, { todo, onToggle: () => {}, onDelete, onEdit: () => {} }))
    el.querySelector('.destroy').click()
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})

describe('TodoList', () => {
  const todos = [
    { id: 1, title: 'First', completed: false },
    { id: 2, title: 'Second', completed: true }
  ]

  it('renders all todos', () => {
    const el = render(h(TodoList, { todos, onToggle: () => {}, onDelete: () => {}, onEdit: () => {}, onToggleAll: () => {} }))
    const items = el.querySelectorAll('.todo-list li')
    expect(items.length).toBe(2)
    expect(items[0].textContent).toContain('First')
    expect(items[1].textContent).toContain('Second')
  })

  it('returns empty section when no todos', () => {
    const el = render(h(TodoList, { todos: [], onToggle: () => {}, onDelete: () => {}, onEdit: () => {}, onToggleAll: () => {} }))
    expect(el.className).toBe('main')
    expect(el.children.length).toBe(0)
  })

  it('calls onToggleAll when toggle-all checkbox changes', () => {
    const onToggleAll = vi.fn()
    const el = render(h(TodoList, { todos, onToggle: () => {}, onDelete: () => {}, onEdit: () => {}, onToggleAll }))
    el.querySelector('.toggle-all').click()
    expect(onToggleAll).toHaveBeenCalled()
  })
})

describe('Footer', () => {
  const todos = [
    { id: 1, title: 'Active', completed: false },
    { id: 2, title: 'Done', completed: true }
  ]

  it('shows remaining count', () => {
    const el = render(h(Footer, { todos, filter: 'all', clearCompleted: () => {} }))
    expect(el.querySelector('.todo-count').textContent).toContain('1 item left')
  })

  it('shows plural items when more than one remaining', () => {
    const allActive = [
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'B', completed: false }
    ]
    const el = render(h(Footer, { todos: allActive, filter: 'all', clearCompleted: () => {} }))
    expect(el.querySelector('.todo-count').textContent).toContain('items')
  })

  it('highlights selected filter', () => {
    const el = render(h(Footer, { todos, filter: 'active', clearCompleted: () => {} }))
    const links = el.querySelectorAll('.filters a')
    expect(links[1].className).toContain('selected')
  })

  it('shows clear completed when there are completed todos', () => {
    const el = render(h(Footer, { todos, filter: 'all', clearCompleted: () => {} }))
    expect(el.querySelector('.clear-completed')).toBeTruthy()
  })

  it('hides clear completed when no completed todos', () => {
    const activeTodos = todos.map(t => ({ ...t, completed: false }))
    const el = render(h(Footer, { todos: activeTodos, filter: 'all', clearCompleted: () => {} }))
    expect(el.querySelector('.clear-completed')).toBeFalsy()
  })

  it('calls clearCompleted on button click', () => {
    const clearCompleted = vi.fn()
    const el = render(h(Footer, { todos, filter: 'all', clearCompleted }))
    el.querySelector('.clear-completed').click()
    expect(clearCompleted).toHaveBeenCalled()
  })
})

describe('App', () => {
  function createMockStore(initialState = { todos: [], filter: 'all' }) {
    let state = { ...initialState }
    const listeners = new Set()
    return {
      getState: () => state,
      setState: vi.fn(partial => {
        state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) }
        listeners.forEach(fn => fn(state))
      }),
      subscribe: vi.fn(fn => { listeners.add(fn); return () => listeners.delete(fn) })
    }
  }

  it('renders header, list, and footer', () => {
    const store = createMockStore({ todos: [{ id: 1, title: 'Test', completed: false }], filter: 'all' })
    const el = render(h(App, { todos: store.getState().todos, filter: store.getState().filter, store }))
    expect(el.querySelector('.header')).toBeTruthy()
    expect(el.querySelector('.main')).toBeTruthy()
    expect(el.querySelector('.footer')).toBeTruthy()
  })

  it('hides footer when no todos', () => {
    const store = createMockStore()
    const el = render(h(App, { todos: [], filter: 'all', store }))
    expect(el.querySelector('.footer')).toBeFalsy()
  })

  it('addTodo adds a new todo to store', () => {
    const store = createMockStore()
    const el = render(h(App, { todos: [], filter: 'all', store }))
    const input = el.querySelector('.new-todo')
    input.value = 'New Task'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(store.setState).toHaveBeenCalled()
  })

  it('filters todos by active', () => {
    const todos = [
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'B', completed: true }
    ]
    const el = render(h(App, { todos, filter: 'active', store: createMockStore({ todos, filter: 'active' }) }))
    expect(el.querySelectorAll('.todo-list li').length).toBe(1)
  })

  it('filters todos by completed', () => {
    const todos = [
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'B', completed: true }
    ]
    const el = render(h(App, { todos, filter: 'completed', store: createMockStore({ todos, filter: 'completed' }) }))
    expect(el.querySelectorAll('.todo-list li').length).toBe(1)
    expect(el.querySelector('.todo-list li').textContent).toContain('B')
  })

  it('patch cycle 0→1→2 todos keeps label empty', () => {
    const store = { setState: vi.fn(), subscribe: vi.fn(), getState: () => ({}) }
    const outlet = document.createElement('div')
    let currentVNode = null

    function render(todos) {
      const newVNode = h(App, { todos, filter: 'all', store })
      patch(outlet, currentVNode, newVNode)
      currentVNode = newVNode
    }

    render([])
    let main = outlet.querySelector('.main')
    expect(main.children.length).toBe(0)

    render([{ id: 1, title: 'ylo', completed: false }])
    main = outlet.querySelector('.main')
    expect(main.children.length).toBe(3)
    expect(main.children[0].tagName).toBe('INPUT')
    expect(main.children[1].tagName).toBe('LABEL')
    expect(main.children[2].tagName).toBe('UL')
    expect(main.querySelector('label').children.length).toBe(0)
    expect(main.querySelector('ul').children.length).toBe(1)

    render([
      { id: 1, title: 'ylo', completed: false },
      { id: 2, title: 'ylo2', completed: false }
    ])
    main = outlet.querySelector('.main')
    expect(main.children.length).toBe(3)
    expect(main.children[0].tagName).toBe('INPUT')
    expect(main.children[1].tagName).toBe('LABEL')
    expect(main.children[2].tagName).toBe('UL')
    expect(main.querySelector('label').children.length).toBe(0)
    expect(main.querySelector('ul').children.length).toBe(2)
  })
})
