import { Jurol } from "../framework/Jurol.js";

export function App() {
  const [count, setCount] = Jurol.useState(0);

  return Jurol.createElement(
    "div",
    null,
    Jurol.createElement("h1", null, count),
    Jurol.createElement(
      "button",
      {
        onClick: () => setCount((c) => c + 1),
      },
      "+",
    ),
  );
}
