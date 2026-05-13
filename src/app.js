import { Jurol } from "../framework/Jurol.js";

export function App() {
  const [count, setCount] = Jurol.useState(0);

  return Jurol.createElement(
    "div",
    null,
    "jurol"
  );
}
