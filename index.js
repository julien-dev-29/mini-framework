import { Jurol } from "./framework/Jurol.js";
import { App } from "./src/app.js";

const root = document.getElementById("root");

Jurol.render(Jurol.createElement(App, null), root);
