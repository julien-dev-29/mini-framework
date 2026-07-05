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
    h('label', { htmlFor: 'toggle-all' }),
    h('ul', { class: 'todo-list' },
      ...todos.map(todo =>
        h(TodoItem, { todo, onToggle, onDelete, onEdit })
      )
    )
  )
}
