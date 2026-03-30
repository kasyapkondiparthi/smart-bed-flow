import { useState, useEffect } from "react";
import { UserPlus, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
}

const PatientForm = ({ onSubmit, onUpdate, onCancelEdit, editingPatient, isLoading }: PatientFormProps) => {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [needsICU, setNeedsICU] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [nameError, setNameError] = useState("");
  const [predictedSeverity, setPredictedSeverity] = useState<Severity | null>(null);

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
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="patientName" className="text-slate-300 font-bold tracking-wide">Patient Name</Label>
          <Input
            id="patientName"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            className="bg-black/40 border-slate-700/50 text-white"
            maxLength={100}
          />
          {nameError && <p className="text-xs text-destructive font-bold animate-pulse">{nameError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="oxygen" className="text-slate-300 font-bold tracking-wide">Oxygen Level (%)</Label>
            <Input
              id="oxygen"
              type="number"
              placeholder="98"
              value={oxygenLevel}
              onChange={(e) => handleOxygenChange(e.target.value)}
              className="bg-black/40 border-slate-700/50 text-white"
              min={0}
              max={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="heartRate" className="text-slate-300 font-bold tracking-wide">Heart Rate (BPM)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={heartRate}
              onChange={(e) => handleHeartRateChange(e.target.value)}
              className="bg-black/40 border-slate-700/50 text-white"
              min={0}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-slate-300 font-bold tracking-wide">Severity Level</Label>
            {predictedSeverity && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                AI Predicted: {predictedSeverity}
              </span>
            )}
          </div>
          <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
            <SelectTrigger className="bg-black/40 border-slate-700/50 text-white focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="Critical" className="focus:bg-red-500/20 focus:text-white">🔴 Critical</SelectItem>
              <SelectItem value="Moderate" className="focus:bg-yellow-500/20 focus:text-white">🟡 Moderate</SelectItem>
              <SelectItem value="Low" className="focus:bg-green-500/20 focus:text-white">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 shadow-inner mt-4">
          <Label htmlFor="needsICU" className="cursor-pointer font-bold text-slate-300 tracking-wide">Needs ICU Bed</Label>
          <Switch id="needsICU" checked={needsICU} onCheckedChange={setNeedsICU} />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            type="submit" 
            className={`w-full h-12 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all font-bold tracking-wider uppercase ${editingPatient ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`} 
            disabled={!name.trim() || !severity || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : editingPatient ? (
              <Save className="w-5 h-5 mr-2" />
            ) : (
              <UserPlus className="w-5 h-5 mr-2" />
            )}
            {isLoading ? (editingPatient ? "Updating..." : "Allocating...") : editingPatient ? "Update Patient" : "Allocate Bed"}
          </Button>

          {editingPatient && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancelEdit}
              className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold uppercase tracking-wider text-xs"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Edit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
