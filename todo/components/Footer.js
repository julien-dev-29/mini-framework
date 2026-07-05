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
