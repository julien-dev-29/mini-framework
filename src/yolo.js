import Jurol from "../framework/Jurol.js";

export const Yolo = () => {
  return Jurol.createElement(
    "div",
    {},
    Jurol.createElement("h1", { class: "yolo" }, "Jurol"),
  );
};
