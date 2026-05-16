import { Link } from "../../framework/router/router.js";
import { Jurol } from "../../framework/core/index.js";
export function NotFound() {
  return Jurol.createElement(
    "div",
    null,
    Jurol.createElement("h1", null, "NotFound"),
    Link({ to: "/home" }, "Go Home"),
  );
}
