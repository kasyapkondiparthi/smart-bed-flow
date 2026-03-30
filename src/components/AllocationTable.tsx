import { useState } from "react";
import { ClipboardList, Trash2, Edit2, Search, UserSearch, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Severity } from "./PatientForm";

export interface PatientRecord {
  id: string;
  name: string;
  severity: Severity;
  needsICU: boolean;
  assignedBed: "ICU" | "Normal" | "Waiting";
  bedNumber?: string | null;
  floorNumber?: number | null;
  oxygenLevel?: number;
  heartRate?: number;
  createdAt?: string;
}

interface AllocationTableProps {
  patients: PatientRecord[];
  onRemovePatient?: (id: string) => void;
  onEditPatient?: (patient: PatientRecord) => void;
}

const AllocationTable = ({ patients, onRemovePatient, onEditPatient }: AllocationTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.severity.toLowerCase().includes(term) ||
      (p.bedNumber || "").toLowerCase().includes(term)
    );
  });

  const exportToCSV = () => {
    const headers = [
      "Patient Name",
      "Severity",
      "ICU Required",
      "Assigned Bed",
      "Bed Number",
      "Floor Number",
      "Last Oxygen Level",
      "Last Heart Rate",
      "Timestamp"
    ];

    const rows = filteredPatients.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.severity,
      p.needsICU ? "Yes" : "No",
      p.assignedBed,
      p.bedNumber || "--",
      p.floorNumber || "--",
      p.oxygenLevel ? `${p.oxygenLevel}%` : "--",
      p.heartRate || "--",
      p.createdAt ? new Date(p.createdAt).toLocaleString() : "--"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `hospital_allocation_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full overflow-hidden transition-all duration-300">
      <div className="p-4 bg-black/20 border-b border-white/5 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name, severity, or bed number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-slate-700/50 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600 h-10 rounded-xl transition-all"
          />
        </div>
        <Button
          onClick={exportToCSV}
          disabled={filteredPatients.length === 0}
          variant="outline"
          className="w-full sm:w-auto h-10 px-6 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          <FileDown className="w-4 h-4 text-blue-400" />
          Export Data
        </Button>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-black/20 m-6 rounded-2xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            {searchTerm ? <UserSearch className="w-8 h-8 text-slate-500" /> : <ClipboardList className="w-8 h-8 text-slate-500" />}
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {searchTerm ? `No results for "${searchTerm}"` : "Awaiting Patient Registrations"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="hover:bg-transparent border-b border-white/10 text-slate-300">
                <TableHead className="w-[200px] font-black text-xs uppercase tracking-widest text-slate-400">Patient Details</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-400">Severity</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-center text-slate-400">Vitals (O₂ / HR)</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-400">Allocation</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-400">Bed Number</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-400">Floor Number</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-right text-slate-400">Time</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {filteredPatients.map((p) => (
                <TableRow key={p.id} className="group transition-all hover:bg-white/5 border-white/5">
                  <TableCell>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-white tracking-wide">{p.name}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${p.needsICU ? 'text-red-400' : 'text-blue-400'}`}>{p.needsICU ? "ICU Required" : "General Ward"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                      p.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                      p.severity === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 
                      'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    }`}>
                      {p.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold">O₂</span>
                        <span className={`text-sm font-mono font-bold ${p.oxygenLevel && p.oxygenLevel < 90 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-slate-300'}`}>
                          {p.oxygenLevel ?? "--"}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold">HR</span>
                        <span className="text-sm font-mono font-bold text-slate-300">
                          {p.heartRate ?? "--"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className={`w-2.5 h-2.5 rounded-full ${
                         p.assignedBed === 'ICU' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                         p.assignedBed === 'Normal' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                       }`} />
                       <span className="text-xs font-bold text-white tracking-widest uppercase">{p.assignedBed}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.bedNumber ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                        {p.bedNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.floorNumber ? (
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">FLR {p.floorNumber}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {onEditPatient && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => onEditPatient(p)}
                          title="Edit Patient"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onRemovePatient && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRemovePatient(p.id)}
                          title="Remove Patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllocationTable;
