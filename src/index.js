import React from "react";
import ReactDOM from "react-dom";
import "./index.css"; // You can remove this if not needed
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported globally

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
