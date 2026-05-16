import { Home } from "./pages/Home.js";
import { About } from "./pages/About.js";
import { NotFound } from "./pages/NotFound.js";
import { Jurol } from "../framework/core/index.js";
import { initRouter, Router } from "../framework/router/router.js";
import { createElement } from "../framework/core/createElement.js";

const routes = {
  "/": Home,
  "/about": About,
  "*": NotFound,
};

function App() {
  return Router();
}

function rerender() {
  Jurol.render(createElement(App), document.getElementById("app"));
}

initRouter(routes, rerender);

rerender();
