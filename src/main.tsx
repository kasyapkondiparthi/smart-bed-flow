const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const url = args[0];

    if (typeof url === "string" && url.includes("vercel.com/api")) {
        console.warn("Blocked Vercel API call:", url);

        return new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    return originalFetch(...args);
};



import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("App loaded successfully");

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
