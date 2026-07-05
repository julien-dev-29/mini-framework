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
