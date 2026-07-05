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
