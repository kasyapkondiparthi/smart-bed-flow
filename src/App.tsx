import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Loaded ✅</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/allocation" element={<div>Allocation</div>} />

        {/* fallback */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;