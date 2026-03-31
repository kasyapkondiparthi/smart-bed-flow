import { useState } from "react";
import { ClipboardList, Trash2, Edit2, Search, UserSearch, FileDown, Activity } from "lucide-react";
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
  status?: "Queue" | "Waiting" | "Pending Approval" | "Confirmed" | "Rejected";
  bedNumber?: string | null;
  floorNumber?: number | null;
  roomNumber?: string | null;
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
    <div className="w-full transition-all duration-300">
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Search database..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 rounded-xl h-10 transition-all placeholder:text-gray-400"
          />
        </div>
        <Button
          onClick={exportToCSV}
          disabled={filteredPatients.length === 0}
          variant="outline"
          className="w-full sm:w-auto h-10 px-5 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 rounded-xl transition-all"
        >
          <FileDown className="w-4 h-4 text-blue-500" />
          Export CSV
        </Button>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 m-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
            {searchTerm ? <UserSearch className="w-8 h-8" /> : <ClipboardList className="w-8 h-8" />}
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">
            {searchTerm ? `No results for "${searchTerm}"` : "Waiting for entries..."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-6">Patient Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Severity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Vitals</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Bed</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-gray-500 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPatients.map((p) => (
                <TableRow key={p.id} className="group transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-700 h-16">
                  <TableCell className="pl-6">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-gray-900 dark:text-white transition-colors">{p.name}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${p.needsICU ? 'text-amber-600 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'}`}>
                        {p.needsICU ? "ICU Required" : "General Ward"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        p.severity === 'Critical' ? 'bg-red-500 text-white' :
                        p.severity === 'Moderate' ? 'bg-yellow-500 text-white' : 
                        'bg-green-500 text-white'
                      }`}>
                        {p.severity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        p.status === 'Confirmed' ? 'bg-emerald-500 text-white' :
                        p.status === 'Pending Approval' ? 'bg-amber-500 text-white animate-pulse' :
                        p.status === 'Waiting' ? 'bg-amber-400/80 text-white animate-pulse' : 
                        p.status === 'Rejected' ? 'bg-red-500 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {p.status === 'Waiting' ? 'Pending Triage' : (p.status || 'Active')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">O₂</span>
                        <span className={`text-xs font-black ${p.oxygenLevel && p.oxygenLevel < 90 ? 'text-red-600 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}>{p.oxygenLevel || "--"}%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">BPM</span>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">{p.heartRate || "--"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-0.5">
                      {p.bedNumber ? (
                        <>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{p.bedNumber}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Floor {p.floorNumber || "-"}</span>
                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            Room {p.assignedBed === "ICU" ? (100 + (parseInt(p.bedNumber.replace(/\D/g, "").slice(-2) || "1") % 20 + 1)) : (200 + (parseInt(p.bedNumber.replace(/\D/g, "").slice(-2) || "1") % 30 + 1))}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unassigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-1">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditPatient?.(p)}
                        title="Edit Patient"
                        className="h-8 w-8 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                         <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemovePatient?.(p.id)}
                        title="Remove Patient"
                        className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                         <Trash2 className="w-4 h-4" />
                      </Button>
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
