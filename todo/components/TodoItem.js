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

  function finishEdit(e, id) {
    const val = e.target.value.trim()
    if (val && val !== todo.title) {
      onEdit(id, val)
    }
    if (e.target.closest('li')) {
      e.target.closest('li').classList.remove('editing')
    }
  }

  function onEditKeydown(e) {
    if (e.key === 'Enter') {
      finishEdit(e, todo.id)
    } else if (e.key === 'Escape') {
      e.target.value = todo.title
      if (e.target.closest('li')) {
        e.target.closest('li').classList.remove('editing')
      }
    }
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
