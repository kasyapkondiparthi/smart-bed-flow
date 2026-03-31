import { useState } from "react";
import PatientForm from "@/components/PatientForm";
import AllocationTable from "@/components/AllocationTable";
import { usePatients } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { PatientRecord } from "@/components/AllocationTable";
import { toast } from "sonner";
import { format } from "date-fns";

const AllocationPage = () => {
  const { 
    patients, 
    handleRemovePatient, 
    handleUpdatePatient, 
    handleAllocate,
    loading, 
    handleReset, 
    history,
    icuAvailable,
    normalAvailable,
    handleApprove,
    handleReject,
    handleManualReallocation,
    fetchPatientsList
  } = usePatients();
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  const handleManualAllocate = async () => {
    const waitingList = patients.filter(p => p.status === "Waiting");
    if (waitingList.length === 0) {
      toast.info("No patients currently in triage waiting list");
      return;
    }

    const confirmed = window.confirm(`Initiate batch allocation for ${waitingList.length} waiting patients? This will process them based on clinical priority.`);
    if (confirmed) {
      await handleManualReallocation();
    }
  };

  const handleEndShift = async () => {
    const confirmed = window.confirm("ATTENTION: Are you sure you want to end the shift? This will generate a shift report and CLEAR the current active patient registry.");
    if (!confirmed) return;

    try {
      if (history && history.length > 0) {
        const headers = ["Patient Name", "Action", "Severity", "Bed", "Floor", "Time"];
        const rows = history.map(h => [
          `"${h.name}"`, h.actionType, h.severity, h.bedNumber || "N/A", h.floorNumber || "N/A", format(new Date(h.timestamp), "yyyy-MM-dd HH:mm:ss")
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `shift_end_audit_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
        link.click();
      }

      await handleReset();
      toast.success("Shift ended successfully. Administrative audit log preserved.");
    } catch (error) {
      toast.error("Shift termination failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all duration-500 ease-in-out p-4 md:p-8 rounded-[2rem]">
      {/* Professional Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 border-b-4 border-white/30 pb-2 inline-block">Patient Allocation</h1>
          <p className="text-blue-100/90 text-sm font-bold mt-2 max-w-md leading-relaxed">
            Mission-critical bed management and <span className="text-emerald-300">real-time triage tracking</span> for clinical resource optimization.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            onClick={() => fetchPatientsList(true)}
            disabled={loading}
            variant="secondary"
            className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-bold uppercase tracking-wider text-[10px] backdrop-blur-sm"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={handleManualAllocate}
            disabled={loading}
            className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all active:scale-95"
          >
            {loading ? "Processing..." : "Batch Allocate"}
          </Button>
          <Button
            onClick={handleEndShift}
            disabled={loading || patients.length === 0}
            className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-lg shadow-rose-500/20 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all active:scale-95"
          >
            {loading ? "Terminating..." : "End Shift"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Intake & Approvals */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-panel overflow-hidden border-t-4 border-t-amber-500">
            <div className="bg-amber-500/10 px-6 py-5 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <h2 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.2em]">
                  Pending Triage Review
                </h2>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-500/20 border border-amber-400">
                {patients.filter(p => p.status === "Waiting" || p.status === "Pending Approval").length} PENDING
              </span>
            </div>
            
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {patients.filter(p => p.status === "Waiting" || p.status === "Pending Approval").length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">All cases processed</p>
                </div>
              ) : (
                patients
                  .filter(p => p.status === "Waiting" || p.status === "Pending Approval")
                  .sort((a, b) => {
                    // Critical first, then by time
                    const sev: Record<string, number> = { Critical: 0, Moderate: 1, Low: 2 };
                    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                  })
                  .map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700 transition-all hover:border-amber-300 dark:hover:border-amber-700 group">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              p.severity === "Critical" ? "bg-red-500" :
                              p.severity === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <p className="font-black text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                              p.severity === "Critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                              p.severity === "Moderate" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            }`}>{p.severity}</span>
                            {p.needsICU && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 uppercase tracking-widest">ICU</span>
                            )}
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Self-Booked</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleApprove(p.id)}
                            title="Approve & Queue for Bed"
                            className="h-8 w-8 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleReject(p.id)}
                            title="Reject & Remove"
                            className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Admittance Form Card */}
          <div className="glass-panel overflow-hidden border-t-4 border-t-primary">
            <div className="px-6 py-5 border-b border-border bg-muted/20">
               <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">{editingPatient ? "Modify Active Case" : "Clinical Intake Entry"}</h2>
            </div>
            <div className="p-6">
              <PatientForm 
                onSubmit={(data) => editingPatient ? handleUpdatePatient(editingPatient.id, data) : handleAllocate(data)} 
                onUpdate={(data) => editingPatient ? handleUpdatePatient(editingPatient.id, data) : null}
                editingPatient={editingPatient}
                onCancelEdit={() => setEditingPatient(null)}
                isLoading={loading} 
                icuAvailable={icuAvailable}
                normalAvailable={normalAvailable}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 h-full">
          <div className="glass-panel overflow-hidden h-full flex flex-col border-t-4 border-t-emerald-500">
            <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Patient Registry</h2>
                  <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                     <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Neural Sync Active</span>
                  </div>
               </div>
               <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                 System Active: <span className="text-blue-600 dark:text-blue-400">{patients.length} Active</span>
               </div>
            </div>
            <div className="p-0">
              <AllocationTable 
                patients={patients} 
                onRemovePatient={handleRemovePatient} 
                onEditPatient={setEditingPatient}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationPage;
