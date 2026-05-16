import { fiberState } from "./fiberState.js";
import { reconcileChildren } from "./reconcile.js";
import { createDom, updateDom } from "./dom.js";

/**
 *
 */
export function performUnitOfWork(fiber) {
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

/**
 *
 */
export function commitRoot() {
  fiberState.deletions.forEach(commitWork);
  commitWork(fiberState.wipRoot.child);
  fiberState.currentRoot = fiberState.wipRoot;
  fiberState.wipRoot = null;
}

/**
 *
 */
function commitWork(fiber) {
  if (!fiber) return;
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }
  if (fiber.child) {
    commitWork(fiber.child);
  }
  if (fiber.sibling) {
    commitWork(fiber.sibling);
  }
}

/**
 *
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

/**
 *
 */
function updateFunctionComponent(fiber) {
  fiberState.wipFiber = fiber;
  fiberState.hookIndex = 0;
  fiberState.wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

/**
 *
 */
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
