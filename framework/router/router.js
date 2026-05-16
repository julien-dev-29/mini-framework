import { Jurol } from "../core";

let routes = {};
let rerender = null;

/**
 * Initialise le router
 */
export function initRouter(routeTable, renderFn) {
  routes = routeTable;
  rerender = renderFn;

  window.addEventListener("popstate", () => {
    rerender();
  });
}

/**
 *
 */
export const navigate = (path) => {
  window.history.pushState({}, "", path);
  if (rerender) rerender();
};

/**
 *
 */
const getRouteComponent = () => {
  const path = window.location.pathname;
  return routes[path] || routes["*"];
};

/**
 *
 */
export const Router = () => {
  const Component = getRouteComponent();
  return Component ? Component() : null;
};

/**
 * Composant Link
 */
export function Link({ to, children, ...props }) {
  return Jurol.createElement(
    "a",
    {
      href: to,
      onClick: (e) => {
        e.preventDefault();
        navigate(to);
      },
    },
    children,
  );
}
