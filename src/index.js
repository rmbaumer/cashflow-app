import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // You can remove this if not needed
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported globally

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
