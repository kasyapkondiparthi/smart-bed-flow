import { Outlet } from "react-router-dom";
import HospitalHeader from "@/components/HospitalHeader";
import Sidebar from "@/components/Sidebar";
import HospitalFooter from "@/components/HospitalFooter";
import { PatientProvider } from "@/context/PatientContext";
import Chatbot from "@/components/Chatbot";

const DashboardLayout = () => {
  return (
    <PatientProvider>
      <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          {/* Subtle background gradient glow behind the main content area */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <HospitalHeader />
          
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
              <Outlet />
            </div>
            {/* The footer was previously here, but modern SaaS dashboards rarely use large footers inside the scrolling view area if there's a sidebar. We can omit it or make it small. */}
            <HospitalFooter />
          </main>

          <Chatbot />
        </div>
      </div>
    </PatientProvider>
  );
};

export default DashboardLayout;
