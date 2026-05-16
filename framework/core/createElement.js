export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter((child) => child !== null && child !== false && child !== true)
        .map((child) =>
          typeof child === "object" ? child : createTextElement(child),
        ),
    },
  };
}

export function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
