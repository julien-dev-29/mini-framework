import { fiberState } from "./fiberState.js";
import { performUnitOfWork } from "../../framework/core/fiber.js";
import { commitRoot } from "./fiber.js";
/**
 *
 */
export function scheduleWork() {
  requestIdleCallback(workLoop);
}

/**
 *
 */
function workLoop(deadline) {
  fiberState.isRendering = true;
  let shouldYield = false;
  while (fiberState.nextUnitOfWork && !shouldYield) {
    fiberState.nextUnitOfWork = performUnitOfWork(fiberState.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!fiberState.nextUnitOfWork && fiberState.wipRoot) commitRoot();
  fiberState.isRendering = false;
  if (fiberState.nextUnitOfWork) scheduleWork();
}
