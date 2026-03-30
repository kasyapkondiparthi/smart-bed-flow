import { Activity } from "lucide-react";

const HospitalFooter = () => (
  <footer className="border-t border-border bg-card/50 mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Smart Hospital Bed Allocation System</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Smart Hospital System. Built for healthcare optimization.
        </p>
      </div>
    </div>
  </footer>
);

export default HospitalFooter;
