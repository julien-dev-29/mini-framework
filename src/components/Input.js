import { Jurol } from "../../framework/core/index.js";

export const Input = ({ type = "text", placeholder = "", ...props }) => {
  return Jurol.createElement("input", {
    type: type,
    placeholder: placeholder,
    ...props,
  });
};
