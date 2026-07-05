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
