import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts/google.css";
import "./index.css";
import App from "./App";
import { greet } from "./console";

greet();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
