import { useState } from "react";
import { usePatients } from "@/context/PatientContext";
import { 
  History, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  RefreshCcw, 
  Trash2,
  Search,
  FilterX,
  FileDown
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
import { format, isSameDay, formatDistanceToNow, parseISO } from "date-fns";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const HistoryPage = () => {
  const { history, fetchPatientsList, loading } = usePatients();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tick, setTick] = useState<number>(0);

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
    const dateMatch = selectedDate 
      ? isSameDay(new Date(entry.timestamp), new Date(selectedDate)) 
      : true;
    
    const slotMatch = timeSlot === "All" 
      ? true 
      : getTimeSlot(entry.timestamp) === timeSlot;

    const searchMatch = entry.name.toLowerCase().includes(searchTerm.toLowerCase());

    return dateMatch && slotMatch && searchMatch;
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case "Added": return <CheckCircle2 className="w-3 h-3" />;
      case "Updated": return <RefreshCcw className="w-3 h-3" />;
      case "Removed": return <Trash2 className="w-3 h-3" />;
      default: return null;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "Added": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Updated": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Removed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Patient History</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium font-mono uppercase tracking-wider">Audit trail of all hospital bed allocations and triage events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPatientsList()}
            disabled={loading}
            className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl gap-2"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh Logs</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-6 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by patient name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-slate-700/50 text-white focus:ring-primary focus:border-primary h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 min-w-[200px] lg:w-64">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-black/40 border-slate-700/50 text-white rounded-xl h-12 hover:bg-white/5 px-4 transition-all",
                    !selectedDate && "text-slate-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(parseISO(selectedDate), "PPP") : <span className="text-sm font-medium">Filter by Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" align="start">
                <CalendarPicker
                  mode="single"
                  selected={selectedDate ? parseISO(selectedDate) : undefined}
                  onSelect={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : "")}
                  initialFocus
                  className="p-6 bg-slate-900"
                  classNames={{
                    month: "space-y-6",
                    caption: "flex justify-center pt-2 relative items-center mb-4",
                    caption_label: "text-lg font-black text-white uppercase tracking-widest",
                    nav: "space-x-2 flex items-center",
                    nav_button: "h-9 w-9 bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all rounded-lg",
                    table: "w-full border-collapse space-y-2",
                    head_row: "flex mb-2",
                    head_cell: "text-slate-500 rounded-md w-11 font-black text-[10px] uppercase tracking-widest",
                    row: "flex w-full mt-2",
                    cell: "h-11 w-11 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-11 w-11 p-0 font-bold text-slate-300 hover:bg-primary/20 hover:text-primary transition-all rounded-lg flex items-center justify-center",
                    day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                    day_today: "bg-white/5 text-primary border border-primary/20",
                    day_outside: "text-slate-700 opacity-50",
                    day_disabled: "text-slate-800 opacity-50",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className="w-full md:w-40 bg-black/40 border-slate-700/50 text-white rounded-xl h-12">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Time Slot" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="All">All Slots</SelectItem>
              <SelectItem value="Morning">Morning (00-12)</SelectItem>
              <SelectItem value="Evening">Evening (12-24)</SelectItem>
            </SelectContent>
          </Select>

          {(selectedDate || timeSlot !== "All" || searchTerm) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setSelectedDate(""); setTimeSlot("All"); setSearchTerm(""); }}
              className="text-slate-500 hover:text-white"
              title="Clear Filters"
            >
              <FilterX className="w-5 h-5" />
            </Button>
          )}

          <div className="h-10 w-[1px] bg-white/10 hidden lg:block mx-2" />

          <Button 
            onClick={exportHistory}
            className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] group transition-all"
          >
            <FileDown className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
            Export History
          </Button>
        </div>
      </div>

      {/* History Registry */}
      <div className="glass-panel overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <History className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No history records found matching the filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="hover:bg-transparent border-b border-white/5 text-slate-400">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Patient Details</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Event Type</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Severity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Allocation</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Time & Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{entry.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">ID: {entry.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getActionColor(entry.actionType)}`}>
                        {getActionIcon(entry.actionType)}
                        {entry.actionType}
                      </span>
                    </TableCell>
                    <TableCell>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         entry.severity === 'Critical' ? 'text-red-500' : 
                         entry.severity === 'Moderate' ? 'text-yellow-500' : 'text-green-500'
                       }`}>
                         {entry.severity}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{entry.assignedBed}</span>
                        {entry.bedNumber && (
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.bedNumber} (FLR {entry.floorNumber})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-bold text-slate-300">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {format(new Date(entry.timestamp), "HH:mm:ss")} • {format(new Date(entry.timestamp), "MMM dd")}
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
