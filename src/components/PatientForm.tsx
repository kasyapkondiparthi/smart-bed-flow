import { useState, useEffect } from "react";
import { UserPlus, Loader2, Save, X, Activity, Bed, MapPin, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PatientRecord } from "./AllocationTable";

export type Severity = "Critical" | "Moderate" | "Low";

export interface PatientInput {
  name: string;
  severity: Severity;
  needsICU: boolean;
  oxygenLevel?: number;
  heartRate?: number;
}

interface PatientFormProps {
  onSubmit: (p: PatientInput) => void;
  onUpdate?: (p: PatientInput) => void;
  onCancelEdit?: () => void;
  editingPatient?: PatientRecord | null;
  isLoading?: boolean;
  icuAvailable?: number;
  normalAvailable?: number;
}

const PatientForm = ({ onSubmit, onUpdate, onCancelEdit, editingPatient, isLoading, icuAvailable, normalAvailable }: PatientFormProps) => {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [needsICU, setNeedsICU] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [nameError, setNameError] = useState("");
  const [predictedSeverity, setPredictedSeverity] = useState<Severity | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (editingPatient) {
      setName(editingPatient.name);
      setSeverity(editingPatient.severity);
      setNeedsICU(editingPatient.needsICU);
      setOxygenLevel(editingPatient.oxygenLevel?.toString() || "");
      setHeartRate(editingPatient.heartRate?.toString() || "");
    } else {
      setName("");
      setSeverity("");
      setNeedsICU(false);
      setOxygenLevel("");
      setHeartRate("");
    }
    setPredictedSeverity(null);
    setNameError("");
  }, [editingPatient]);

  const updatePredictedSeverity = (oxyStr: string, hrStr: string) => {
    const oxygen = parseFloat(oxyStr);
    const hr = parseInt(hrStr);
    
    let isCritical = false;
    let isModerate = false;

    if (!isNaN(oxygen)) {
      if (oxygen < 90) isCritical = true;
      else if (oxygen <= 95) isModerate = true;
    }

    if (!isNaN(hr)) {
      if (hr > 120 || hr < 50) isCritical = true;
      else if (hr > 100 || hr < 60) isModerate = true;
    }

    if (!isNaN(oxygen) || !isNaN(hr)) {
      let pred: Severity = "Low";
      if (isCritical) pred = "Critical";
      else if (isModerate) pred = "Moderate";

      setPredictedSeverity(pred);
      setSeverity(pred);
      if (pred === "Critical") {
        setNeedsICU(true);
      } else if (pred === "Low" && !isCritical) {
        setNeedsICU(false);
      }
    } else {
      setPredictedSeverity(null);
    }
  };

  const handleOxygenChange = (val: string) => {
    setOxygenLevel(val);
    updatePredictedSeverity(val, heartRate);
  };

  const handleHeartRateChange = (val: string) => {
    setHeartRate(val);
    updatePredictedSeverity(oxygenLevel, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Patient name is required");
      return;
    }
    if (!severity) return;
    
    const payload: PatientInput = { 
      name: name.trim(), 
      severity: severity as Severity, 
      needsICU,
      oxygenLevel: oxygenLevel ? parseFloat(oxygenLevel) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined
    };

    setShowConfirmDialog(true);
  };

  const finalizeAllocation = () => {
    const payload: PatientInput = { 
      name: name.trim(), 
      severity: severity as Severity, 
      needsICU,
      oxygenLevel: oxygenLevel ? parseFloat(oxygenLevel) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined
    };

    if (editingPatient && onUpdate) {
      onUpdate(payload);
    } else {
      onSubmit(payload);
      
      setName("");
      setSeverity("");
      setNeedsICU(false);
      setOxygenLevel("");
      setHeartRate("");
      setPredictedSeverity(null);
    }
    setShowConfirmDialog(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="patientName" className="text-foreground/60 dark:text-gray-400 font-black uppercase tracking-[0.2em] text-[9px] ml-1">Patient Trace Identity</Label>
          <Input
            id="patientName"
            placeholder="Search or Enter Full Legal Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            className="bg-muted/30 dark:bg-gray-900/50 border-border dark:border-gray-700 text-foreground h-12 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50 font-bold"
            maxLength={100}
          />
          {nameError && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest ml-1 animate-pulse">! Error: {nameError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="oxygen" className="text-foreground/60 dark:text-gray-400 font-black uppercase tracking-[0.2em] text-[9px] ml-1">SpO₂ Telemetry (%)</Label>
            <Input
              id="oxygen"
              type="number"
              placeholder="98"
              value={oxygenLevel}
              onChange={(e) => handleOxygenChange(e.target.value)}
              className="bg-muted/30 dark:bg-gray-900/50 border-border dark:border-gray-700 text-foreground h-12 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all font-mono font-bold"
              min={0}
              max={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heartRate" className="text-foreground/60 dark:text-gray-400 font-black uppercase tracking-[0.2em] text-[9px] ml-1">Pulse (BPM)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={heartRate}
              onChange={(e) => handleHeartRateChange(e.target.value)}
              className="bg-muted/30 dark:bg-gray-900/50 border-border dark:border-gray-700 text-foreground h-12 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all font-mono font-bold"
              min={0}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Triage Priority</Label>
            {predictedSeverity && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                AI Sugg: {predictedSeverity}
              </span>
            )}
          </div>
          <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white h-11 rounded-xl focus:ring-blue-500">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              <SelectItem value="Critical">🔴 Critical</SelectItem>
              <SelectItem value="Moderate">🟡 Moderate</SelectItem>
              <SelectItem value="Low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 transition-all">
          <div className="flex flex-col">
            <Label htmlFor="needsICU" className="cursor-pointer font-bold text-gray-700 dark:text-gray-200 text-xs">ICU ADMISSION</Label>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">High Acuity Monitoring</span>
          </div>
          <Switch id="needsICU" checked={needsICU} onCheckedChange={setNeedsICU} />
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            type="submit" 
            className={`w-full h-11 shadow-md transition-all font-bold tracking-widest uppercase rounded-xl ${editingPatient ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`} 
            disabled={!name.trim() || !severity || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : editingPatient ? (
              <Save className="w-5 h-5 mr-2" />
            ) : (
              <UserPlus className="w-5 h-5 mr-2" />
            )}
            {isLoading ? (editingPatient ? "Updating..." : "Processing...") : editingPatient ? "Save Changes" : "Book Patient"}
          </Button>

          {editingPatient && (
            <Button 
              type="button" 
              variant="ghost"
              onClick={onCancelEdit}
              className="w-full h-11 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              disabled={isLoading}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </form>
      
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card dark:bg-slate-900 border-border dark:border-white/10 text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-10 max-w-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <AlertDialogHeader className="relative z-10">
            <AlertDialogTitle className="flex items-center gap-4 text-3xl font-black tracking-tighter text-foreground mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              Admission Protocol
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold leading-relaxed text-base">
              Synchronizing neural registry. Confirm clinical admittance parameters for <span className="text-primary font-black italic">"{name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid grid-cols-1 gap-4 py-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Target Ward</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {needsICU ? "ICU (Floor 1)" : "General (Floor 2)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Available Capacity</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {(needsICU ? icuAvailable : normalAvailable) ?? 0} Beds Remaining
                </p>
              </div>
            </div>

            {((needsICU ? icuAvailable : normalAvailable) ?? 0) <= 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-red-600 dark:text-red-400">Capacity Alert</p>
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Target matrix full. Patient will be prioritized in the waiting registry.
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={finalizeAllocation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-blue-500/20"
            >
              Confirm Admission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientForm;
