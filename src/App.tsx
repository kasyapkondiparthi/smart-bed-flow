import React, { useEffect, Component, ReactNode } from "react";
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
import { applyTheme, loadTheme } from "./utils/theme.ts";
import { PatientProvider } from "./context/PatientContext.tsx";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Handled error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Error loading app</h1>
            <p>Something went wrong. Please check the console or refresh the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainApp = () => {
  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-foreground dark:text-white transition-all">
      <QueryClientProvider client={queryClient}>
        <PatientProvider>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PatientProvider>
      </QueryClientProvider>
    </div>
  );
};

const App = () => {
  try {
    return (
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    );
  } catch (e) {
    return <div>Error loading app</div>;
  }
};

export default App;

