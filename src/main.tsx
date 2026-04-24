console.log("main.tsx: Script execution started.");

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx: Imports completed.");

const rootElement = document.getElementById("root");

if (rootElement) {
    console.log("main.tsx: Root element found, starting render...");
    try {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log("main.tsx: Render called.");
    } catch (e) {
        console.error("main.tsx: Render error:", e);
    }
} else {
    console.error("main.tsx: Root element NOT found!");
}