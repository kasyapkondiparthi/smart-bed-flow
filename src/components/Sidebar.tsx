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
    <aside className="w-64 border-r border-border bg-slate-900/50 backdrop-blur-xl flex-col hidden md:flex shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <BedDouble className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white drop-shadow-md">SmartBed</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-primary/20 text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] border border-primary/30 scale-105 ml-2"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>    
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-sm font-bold text-white">DR</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Dr. Admin</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
