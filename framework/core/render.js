import { fiberState } from "../../framework/core/fiberState.js";
import { scheduleWork } from "../../framework/core/scheduler.js";

/**
 *
 */
export function render(element, container) {
  fiberState.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: fiberState.currentRoot,
  };
  fiberState.deletions = [];
  fiberState.nextUnitOfWork = fiberState.wipRoot;
  scheduleWork();
}
