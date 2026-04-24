console.log("main.tsx: Script evaluation started.");

const init = async () => {
    console.log("main.tsx: Initializing app...");
    try {
        const [React, ReactDOM, { default: App }] = await Promise.all([
            import("react"),
            import("react-dom/client"),
            import("./App")
        ]);
        await import("./index.css");

        console.log("main.tsx: Imports successful. Mounting...");
        
        const rootElement = document.getElementById("root");
        if (!rootElement) throw new Error("Root element not found");

        const root = ReactDOM.default.createRoot(rootElement);
        root.render(
            React.default.createElement(React.default.StrictMode, null, 
                React.default.createElement(App)
            )
        );
        console.log("main.tsx: Render called.");
    } catch (error) {
        console.error("main.tsx: Critical initialization error:", error);
        document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Critical Error</h1><pre>${error.stack || error.message}</pre></div>`;
    }
};

init();