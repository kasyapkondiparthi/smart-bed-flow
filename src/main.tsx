// 🔥 BLOCK INVALID VERCEL API CALLS (Fetch, XHR, EventSource)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const url = args[0];
    if (typeof url === "string" && url.includes("/api/v6")) {
        console.warn("Blocked invalid fetch API:", url);
        return new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    return originalFetch(...args);
};

const OriginalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    xhr.open = function(method: string, url: string | URL) {
        const urlString = typeof url === 'string' ? url : url.toString();
        if (urlString.includes("/api/v6")) {
            console.warn("Blocked invalid XHR API:", urlString);
            Object.defineProperty(xhr, 'send', { value: function() { 
                Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
                Object.defineProperty(xhr, 'status', { value: 200, writable: false });
                Object.defineProperty(xhr, 'responseText', { value: "{}", writable: false });
                if (xhr.onreadystatechange) xhr.onreadystatechange(new Event('readystatechange'));
                if (xhr.onload) xhr.onload(new ProgressEvent('load'));
            }});
            return;
        }
        return originalOpen.apply(this, arguments as any);
    };
    return xhr;
} as any;

const OriginalEventSource = window.EventSource;
if (OriginalEventSource) {
    window.EventSource = function(url: string | URL, eventSourceInitDict?: EventSourceInit) {
        const urlString = typeof url === 'string' ? url : url.toString();
        if (urlString.includes("/api/v6")) {
            console.warn("Blocked invalid EventSource API:", urlString);
            return {
                close: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                onerror: null,
                onmessage: null,
                onopen: null,
                readyState: 0,
                url: urlString,
                withCredentials: false
            } as unknown as EventSource;
        }
        return new OriginalEventSource(url, eventSourceInitDict);
    } as any;
}

// ✅ GLOBAL ERROR HANDLING (For Blank Screen Debugging)
window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global Error Caught:", { message, source, lineno, colno, error });
};
window.onunhandledrejection = (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
};

// ✅ IMPORTS (ONLY ONCE)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ DEBUG
console.log("Main entry point hit. App component imported.");

// ✅ RENDER
try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error("Failed to find the root element");
    }
    
    console.log("Rendering App to root element...");
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
    console.log("App.render() called successfully.");
} catch (error) {
    console.error("Critical error during initial render:", error);
    document.body.innerHTML = `
        <div style="padding: 20px; color: white; background: #111; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; font-family: sans-serif;">
            <div>
                <h1 style="color: #ff4d4d;">Critical Load Error</h1>
                <p>The application failed to start. Please check the console for details.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; border-radius: 4px;">Refresh Page</button>
            </div>
        </div>
    `;
}