import { Jurol } from "../../framework/core";

export const TodoInput = () => {
  const [text, setText] = Jurol.useState("");

  function submitTodo(e) {
    console.log("submit:", text);
    setText("");
    e.target.value = "";
  }

  return Jurol.createElement("input", {
    name: "todo",
    value: text,
    type: "text",

    onInput: (e) => {
      setText(e.target.value);
    },

    onKeyDown: (e) => {
      if (e.key === "Enter" && e.target.value.length > 0) {
        submitTodo(e);
      }
    },
  });
};
