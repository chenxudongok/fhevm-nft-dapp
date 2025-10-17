import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ⚠️ 确保 global 和 Buffer 在浏览器里存在
import { Buffer } from "buffer";
import process from "process";

if (typeof global === "undefined") window.global = window;
window.Buffer = Buffer;
window.process = process;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
