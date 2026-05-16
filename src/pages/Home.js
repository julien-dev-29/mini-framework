import { Jurol } from "../../framework/core/index.js";
import { Flex } from "../components/Flex.js";
import { TodoInput } from "../components/TodoInput.js";

export function Home() {
  return Jurol.createElement(
    "div",
    null,
    Jurol.createElement("h1", { className: "title" }, "todos"),
    Flex({
      children: TodoInput({
        type: "text",
        className: "new-todo",
        placeholder: "What needs to be done?",
      }),
    }),
  );
}
