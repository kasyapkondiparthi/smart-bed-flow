// 🔥 BLOCK INVALID VERCEL API CALLS
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

// ✅ IMPORTS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ RENDER
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);