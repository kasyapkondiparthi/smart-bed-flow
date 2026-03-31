import { NavLink } from "react-router-dom";
import { BedDouble, LayoutDashboard, Info, History } from "lucide-react";

const navItems = [
  { name: "Command Center", path: "/dashboard", icon: LayoutDashboard },
  { name: "Patient Allocation", path: "/dashboard/allocation", icon: BedDouble },
  { name: "Patient History", path: "/dashboard/history", icon: History },
  { name: "About System", path: "/dashboard/about", icon: Info },
];

const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-border bg-muted/40 backdrop-blur-xl flex flex-col hidden md:flex shrink-0 transition-all">
      <div className="h-16 flex items-center px-6 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <BedDouble className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground drop-shadow-md">SmartBed</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 font-sans">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md border border-primary/20 scale-105 ml-2"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent"
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>    
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shadow-inner">
            <span className="text-sm font-bold text-foreground">DR</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Dr. Admin</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
