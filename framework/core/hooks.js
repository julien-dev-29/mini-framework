import { fiberState } from "../../framework/core/fiberState.js";
import { scheduleWork } from "../../framework/core/scheduler.js";
/**
 *
 */
export function useState(initial) {
  const oldHook =
    fiberState.wipFiber.alternate &&
    fiberState.wipFiber.alternate.hooks &&
    fiberState.wipFiber.alternate.hooks[fiberState.hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? [...oldHook.queue] : [];
  actions.forEach((action) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });
  if (oldHook) {
    oldHook.queue = [];
  }
  const setState = (action) => {
    hook.queue.push(action);
    if (!fiberState.wipRoot && !fiberState.isRendering) {
      fiberState.wipRoot = {
        dom: fiberState.currentRoot.dom,
        props: fiberState.currentRoot.props,
        alternate: fiberState.currentRoot,
      };

      fiberState.nextUnitOfWork = fiberState.wipRoot;
      fiberState.deletions = [];
      scheduleWork();
    }
  };
  fiberState.wipFiber.hooks.push(hook);
  fiberState.hookIndex++;
  return [hook.state, setState];
}
