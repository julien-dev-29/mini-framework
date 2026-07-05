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
      } else if (key === 'checked' || key === 'disabled' || key === 'readonly' || key === 'autofocus') {
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
