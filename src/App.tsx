import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import Overview from "./pages/dashboard/Overview.tsx";
import AllocationPage from "./pages/dashboard/AllocationPage.tsx";
import HistoryPage from "./pages/dashboard/HistoryPage.tsx";
import AboutPage from "./pages/dashboard/AboutPage.tsx";
import Login from "./pages/Login.tsx";
import Welcome from "./pages/Welcome.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthGuard from "./components/AuthGuard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            } 
          >
            <Route index element={<Overview />} />
            <Route path="allocation" element={<AllocationPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
