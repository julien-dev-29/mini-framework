import { Link } from "../../framework/router/router.js";
import { Jurol } from "../../framework/core/index.js";
export function About() {
  return Jurol.createElement(
    "div",
    null,
    Jurol.createElement("h1", null, "About"),
    Link({ to: "/" , children: "yolo"}),
  );
}
