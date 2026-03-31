import { useState } from "react";
import { usePatients } from "@/context/PatientContext";
import { 
  Search,
  Clock,
  X,
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const HistoryPage = () => {
  const { history, refreshHistory, loading } = usePatients();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tick, setTick] = useState<number>(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Force re-render every minute to update "Time Ago" labels
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeSlot = (timestamp: string) => {
    const hour = new Date(timestamp).getHours();
    return hour < 12 ? "Morning" : "Evening";
  };

  const filteredHistory = history.filter((entry) => {
    const entryDate = new Date(entry.timestamp).toLocaleDateString();
    const dateMatch = selectedDate
      ? entryDate === selectedDate.toLocaleDateString()
      : true;
    
    const slotMatch = timeSlot === "All" 
      ? true 
      : getTimeSlot(entry.timestamp) === timeSlot;

    const searchMatch = entry.name.toLowerCase().includes(searchTerm.toLowerCase());

    return dateMatch && slotMatch && searchMatch;
  });

  const exportHistory = () => {
    if (filteredHistory.length === 0) {
      toast.error("No data available to export for the selected filters");
      return;
    }

    const headers = [
      "Patient Name",
      "Action Type",
      "Severity",
      "ICU Requirement",
      "Assigned Bed",
      "Bed Number",
      "Floor Number",
      "Timestamp"
    ];

    const rows = filteredHistory.map((h) => [
      `"${h.name}"`,
      h.actionType,
      h.severity,
      h.needsICU ? "Yes" : "No",
      h.assignedBed,
      h.bedNumber || "N/A",
      h.floorNumber || "N/A",
      format(new Date(h.timestamp), "yyyy-MM-dd HH:mm:ss")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileDate = selectedDate || "all-dates";
    const fileSlot = timeSlot.toLowerCase() || "all-slots";
    
    link.setAttribute("href", url);
    link.setAttribute("download", `patient_history_${fileDate}_${fileSlot}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Patient history report exported successfully");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Professional Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 border-b-4 border-white/30 pb-2 inline-block">Shift Audit Logs</h1>
          <p className="text-blue-100/90 text-sm font-bold mt-2 max-w-md leading-relaxed">
            Comprehensive historical registry of <span className="text-emerald-300">all clinical admissions</span> and resource lifecycle events.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refreshHistory()}
            disabled={loading}
            className="h-11 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl font-black uppercase tracking-widest text-[11px] backdrop-blur-md shadow-inner transition-all active:scale-95"
          >
            {loading ? "Refreshing..." : "Re-Sync Logs"}
          </Button>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Neural Feed</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-8 mb-8 flex flex-col lg:flex-row items-center gap-6 border-l-4 border-l-primary">
        <div className="relative flex-1 group w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Search patient trace identity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-muted/30 dark:bg-gray-900 border-border dark:border-gray-700 text-foreground focus:ring-2 focus:ring-primary/40 h-14 pl-12 rounded-2xl transition-all font-bold placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 min-w-[220px] lg:w-72">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-black bg-muted/30 dark:bg-gray-900 border-border dark:border-white/10 text-foreground rounded-2xl h-14 hover:bg-muted/50 transition-all px-5 shadow-sm group",
                    !selectedDate && "text-muted-foreground/50"
                  )}
                >
                  <span className="truncate">
                    {selectedDate 
                      ? format(selectedDate, "PPP") 
                      : <span className="text-[10px] uppercase tracking-[0.2em]">Select Trace Date</span>
                    }
                  </span>
                  {selectedDate && (
                    <X 
                      className="w-4 h-4 ml-2 hover:text-primary transition-colors cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(undefined);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card dark:bg-slate-900 border-border dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" align="start">
                <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter by date</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => {
                      setSelectedDate(new Date());
                      setIsCalendarOpen(false);
                    }}
                  >
                    Today
                  </Button>
                </div>
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className="p-6 bg-transparent text-foreground"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className="w-full md:w-44 bg-muted/30 dark:bg-gray-900 border-border dark:border-gray-700 text-foreground font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 focus:ring-2 focus:ring-primary/40 transition-all">
              <SelectValue placeholder="Time Slot" />
            </SelectTrigger>
            <SelectContent className="bg-card dark:bg-slate-900 border-border dark:border-white/10 text-foreground rounded-2xl">
              <SelectItem value="All" className="font-bold uppercase tracking-widest text-[10px]">All Slots</SelectItem>
              <SelectItem value="Morning" className="font-bold uppercase tracking-widest text-[10px]">Morning (AM)</SelectItem>
              <SelectItem value="Evening" className="font-bold uppercase tracking-widest text-[10px]">Evening (PM)</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={exportHistory}
            className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
          >
            Audit Export
          </Button>
        </div>
      </div>

      {/* History Registry */}
      <div className="glass-panel overflow-hidden border-t-4 border-t-emerald-500">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-32 opacity-40 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] font-mono italic">Trace ID Log Empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border transition-none">
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground/60 pl-10 h-20">Patient Trace Identity</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground/60 h-20">Event Vector</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground/60 h-20">Acuity Status</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground/60 h-20">Resource Target</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-foreground/60 text-right pr-10 h-20">Temporal Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 dark:hover:bg-muted/10 border-border transition-colors group h-24">
                    <TableCell className="pl-10">
                      <div>
                        <p className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-0.5">{entry.name}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] opacity-60">ID: {entry.id.slice(0, 12)} • Clinical-Trace</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${
                        entry.actionType === 'Added' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                        entry.actionType === 'Updated' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                        'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                      }`}>
                        {entry.actionType}
                      </span>
                    </TableCell>
                    <TableCell>
                       <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border shadow-sm ${
                         entry.severity === 'Critical' ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 
                         entry.severity === 'Moderate' ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                         'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                       }`}>
                         {entry.severity}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground uppercase tracking-tight">{entry.assignedBed}</span>
                        {entry.bedNumber && (
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                             <span className="text-primary">BED {entry.bedNumber}</span> • FLOOR {entry.floorNumber}
                           </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-primary italic tracking-tight">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                          {format(new Date(entry.timestamp), "HH:mm")} • {format(new Date(entry.timestamp), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
