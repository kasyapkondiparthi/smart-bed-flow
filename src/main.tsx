// 🔥 ADD THIS AT VERY TOP (FIRST LINE)
const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const url = args[0];

    if (typeof url === "string" && url.includes("/api/v6")) {
        console.warn("Blocked invalid API:", url);

        return new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    return originalFetch(...args);
};

// 👇 THEN YOUR NORMAL IMPORTS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("App loaded successfully");

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
