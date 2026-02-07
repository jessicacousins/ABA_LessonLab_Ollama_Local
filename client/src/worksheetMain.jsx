import React from "react";
import ReactDOM from "react-dom/client";
import WorksheetApp from "./WorksheetApp.jsx";
import "./styles.css";
import "./worksheet.css";

ReactDOM.createRoot(document.getElementById("worksheet-root")).render(
  <React.StrictMode>
    <WorksheetApp />
  </React.StrictMode>
);
