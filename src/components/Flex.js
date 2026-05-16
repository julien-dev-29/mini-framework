import { Jurol } from "../../framework/core";

export const Flex = ({ children }) => {
  return Jurol.createElement(
    "div",
    {
      style: "display:flex;justify-content:center;margin-top:64px",
    },
    children,
  );
};
