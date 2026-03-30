import { useState } from "react";
import PatientForm from "@/components/PatientForm";
import AllocationTable from "@/components/AllocationTable";
import { usePatients } from "@/context/PatientContext";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import { PatientRecord } from "@/components/AllocationTable";

const AllocationPage = () => {
  const { patients, handleRemovePatient, handleAllocate, handleUpdatePatient, loading, handleReset } = usePatients();
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);

  const onUpdate = async (input: any) => {
    if (editingPatient) {
      await handleUpdatePatient(editingPatient.id, input);
      setEditingPatient(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-2">Patient Allocation workspace</h1>
          <p className="text-sm text-slate-400 font-medium">Register new patients and manage real-time bed allocations.</p>
        </div>
        <Button
          onClick={handleReset}
          disabled={loading || patients.length === 0}
          className="gap-2 h-10 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all rounded-full font-bold uppercase tracking-wider text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Reset System
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">{editingPatient ? "Update Patient" : "New Patient Intake"}</h2>
            <PatientForm 
              onSubmit={handleAllocate} 
              onUpdate={onUpdate}
              editingPatient={editingPatient}
              onCancelEdit={() => setEditingPatient(null)}
              isLoading={loading} 
            />
          </div>
          
          <div className="p-5 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-wider uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]">i</span>
              Priority Allocation Active
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1">
              Patients are automatically prioritized based on clinical severity. 
              <span className="font-bold text-red-400 mx-1 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">Critical</span> patients 
              receive the highest priority for available ICU and Normal beds, regardless of their arrival time.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Allocation Registry</h2>
            <div className="text-xs px-4 py-1.5 bg-white/5 border border-white/10 rounded-full font-medium text-slate-300 uppercase tracking-widest shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
              Total Admitted: <span className="font-black text-white ml-1">{patients.length}</span>
            </div>
          </div>
          <div className="glass-panel overflow-hidden">
            <AllocationTable 
              patients={patients} 
              onRemovePatient={handleRemovePatient} 
              onEditPatient={setEditingPatient}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationPage;
