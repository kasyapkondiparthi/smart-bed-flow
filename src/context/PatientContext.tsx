import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PatientRecord } from "@/components/AllocationTable";
import type { PatientInput } from "@/components/PatientForm";
import { toast } from "sonner";

export const ICU_TOTAL = 10;
export const NORMAL_TOTAL = 30;

export interface HistoryEntry {
  id: string;
  patientId?: string; // Opt-in to track unique records
  name: string;
  severity: string;
  needsICU: boolean;
  assignedBed: string;
  bedNumber: string | null;
  floorNumber: number | null;
  status?: string;
  actionType: "Added" | "Updated" | "Removed";
  timestamp: string;
}

interface PatientContextType {
  patients: PatientRecord[];
  history: HistoryEntry[];
  loading: boolean;
  initialLoading: boolean;
  icuUsed: number;
  normalUsed: number;
  waitingCount: number;
  icuAvailable: number;
  normalAvailable: number;
  fetchPatientsList: (manual?: boolean) => Promise<void>;
  refreshHistory: () => Promise<void>;
  handleAllocate: (input: PatientInput) => Promise<void>;
  handleUpdatePatient: (id: string, input: PatientInput) => Promise<void>;
  handleApprove: (id: string) => Promise<void>;
  handleReject: (id: string) => Promise<void>;
  handleManualReallocation: () => Promise<void>;
  handleRemovePatient: (id: string) => Promise<void>;
  handleReset: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: React.ReactNode }) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem("hospital_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const runGlobalReallocation = useCallback(async () => {
    const { data: allPatients } = await supabase.from("patients").select("*").order("created_at", { ascending: true });
    const currentPatients = allPatients || [];

    const occupants = currentPatients.filter((p: any) => p.assigned_bed !== "Waiting");
    const icuUsedCount = occupants.filter((p: any) => p.assigned_bed === "ICU").length;
    const normalUsedCount = occupants.filter((p: any) => p.assigned_bed === "Normal").length;

    const occupiedICU = new Set(occupants.filter((p: any) => p.assigned_bed === "ICU" && p.bed_number).map((p: any) => p.bed_number));
    const occupiedNormal = new Set(occupants.filter((p: any) => p.assigned_bed === "Normal" && p.bed_number).map((p: any) => p.bed_number));

    let localIcuAvailable = ICU_TOTAL - icuUsedCount;
    let localNormalAvailable = NORMAL_TOTAL - normalUsedCount;

    const severityMap: Record<string, number> = { Critical: 0, Moderate: 1, Low: 2 };
    const waitlist = currentPatients
      .filter((p: any) => p.assigned_bed === "Waiting" && (p.status === "Confirmed" || p.severity === "Critical"))
      .sort((a: any, b: any) => {
        if (severityMap[a.severity] !== severityMap[b.severity]) {
          return severityMap[a.severity] - severityMap[b.severity];
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

    const updatesTemp: any[] = [];
    for (const p of waitlist) {
      let assigned: "ICU" | "Normal" | "Waiting" | null = null;
      let bed_number: string | null = null;
      let floor_number: number | null = null;

      if (p.needs_icu && localIcuAvailable > 0) {
        assigned = "ICU";
        localIcuAvailable--;
      } else if (!p.needs_icu && localNormalAvailable > 0) {
        assigned = "Normal";
        localNormalAvailable--;
      } else if (!p.needs_icu && localNormalAvailable <= 0 && localIcuAvailable > 0) {
        assigned = "ICU";
        localIcuAvailable--;
      }

      if (assigned === "ICU") {
        for (let i = 1; i <= ICU_TOTAL; i++) {
          const bedStr = `ICU-${i}`;
          if (!occupiedICU.has(bedStr)) {
            bed_number = bedStr;
            floor_number = 1;
            occupiedICU.add(bedStr);
            break;
          }
        }
      } else if (assigned === "Normal") {
        for (let i = 1; i <= NORMAL_TOTAL; i++) {
          const bedStr = `N-${i}`;
          if (!occupiedNormal.has(bedStr)) {
            bed_number = bedStr;
            floor_number = 2;
            occupiedNormal.add(bedStr);
            break;
          }
        }
      }

      if (assigned) {
        updatesTemp.push(supabase.from("patients").update({ 
          assigned_bed: assigned,
          bed_number,
          floor_number
        }).eq("id", p.id));
      }
    }

    if (updatesTemp.length > 0) {
      await Promise.all(updatesTemp);
    }
  }, []);

  const fetchPatientsList = useCallback(async (manual = false) => {
    // Only show loading if manual refresh to avoid interrupting realtime updates
    if (manual === true) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load patients");
      } else {
        setPatients(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            severity: p.severity,
            needsICU: p.needs_icu,
            assignedBed: p.assigned_bed,
            bedNumber: p.bed_number,
            floorNumber: p.floor_number,
            oxygenLevel: p.oxygen_level,
            heartRate: p.heart_rate,
            createdAt: p.created_at,
            status: p.status,
          }))
        );

        if (manual === true) {
          // Trigger reallocation check as well to ensure total system consistency
          await runGlobalReallocation();
          toast.success("Patient registry updated", {
            description: "Data synchronized and allocations re-evaluated."
          });
        }
      }
    } finally {
      if (manual === true) setLoading(false);
    }
  }, [runGlobalReallocation]);

  useEffect(() => {
    fetchPatientsList().then(() => setInitialLoading(false));

    const channel = supabase
      .channel("patients-all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        async (payload) => {
          await fetchPatientsList();
          // If a new patient and it's 'Waiting', trigger reallocation
          if (payload.eventType === "INSERT" && payload.new.assigned_bed === "Waiting") {
            runGlobalReallocation();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatientsList, runGlobalReallocation]);

  const logHistory = useCallback((patient: any, actionType: "Added" | "Updated" | "Removed", customTimestamp?: string) => {
    const entry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: patient.id || patient.patientId,
      name: patient.name,
      severity: patient.severity,
      needsICU: patient.needs_icu || patient.needsICU,
      assignedBed: patient.assigned_bed || patient.assignedBed,
      bedNumber: patient.bed_number || patient.bedNumber,
      floorNumber: patient.floor_number || patient.floorNumber,
      actionType,
      timestamp: customTimestamp || new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem("hospital_history", JSON.stringify(updated.slice(0, 100))); // Persist last 100 entries
      return updated;
    });
  }, []);

  // Backfill: Add existing patients from DB to history if not present
  useEffect(() => {
    if (!initialLoading && patients.length > 0) {
      const existingIds = new Set(history.map(h => h.patientId).filter(Boolean));
      const missingPatients = patients.filter(p => !existingIds.has(p.id));

      if (missingPatients.length > 0) {
        missingPatients.forEach(p => {
          logHistory(p, "Added", p.createdAt);
        });
      }
    }
  }, [initialLoading, patients, history, logHistory]);

  const icuUsed = patients.filter((p) => p.assignedBed === "ICU").length;
  const normalUsed = patients.filter((p) => p.assignedBed === "Normal").length;
  const waitingCount = patients.filter((p) => p.assignedBed === "Waiting").length;
  const icuAvailable = ICU_TOTAL - icuUsed;
  const normalAvailable = NORMAL_TOTAL - normalUsed;

  const handleAllocate = useCallback(async (input: PatientInput) => {
    setLoading(true);
    try {
      if (!input.name.trim()) {
        toast.error("Patient name is required");
        return;
      }
      
      const { data: inserted, error: insertError } = await supabase.from("patients").insert({
        name: input.name.trim(),
        severity: input.severity,
        needs_icu: input.needsICU,
        assigned_bed: "Waiting",
        oxygen_level: input.oxygenLevel,
        heart_rate: input.heartRate,
        status: input.severity === "Critical" ? "Confirmed" : "Waiting"
      }).select().single();

      if (insertError) throw insertError;

      await runGlobalReallocation();
      await fetchPatientsList();
      
      const { data: updatedPatient } = await supabase.from("patients").select("*").eq("id", inserted.id).single();
      if (updatedPatient) logHistory(updatedPatient, "Added");
      
      toast.success(`${inserted.name} processed successfully`);
    } catch (err: unknown) {
      toast.error("Validation failed or database error");
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList, logHistory]);

  const handleUpdatePatient = useCallback(async (id: string, input: PatientInput) => {
    setLoading(true);
    try {
      if (!input.name.trim()) {
        toast.error("Patient name is required");
        return;
      }

      const { error: updateError } = await supabase
        .from("patients")
        .update({
          name: input.name.trim(),
          severity: input.severity,
          needs_icu: input.needsICU,
          oxygen_level: input.oxygenLevel,
          heart_rate: input.heartRate,
          assigned_bed: "Waiting",
          bed_number: null,
          floor_number: null
        })
        .eq("id", id);

      if (updateError) throw updateError;

      await runGlobalReallocation();
      await fetchPatientsList();

      const { data: updatedPatient } = await supabase.from("patients").select("*").eq("id", id).single();
      if (updatedPatient) logHistory(updatedPatient, "Updated");

      toast.success(`${input.name} updated successfully`);
    } catch (err: unknown) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList, logHistory]);

  const handleApprove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("patients").update({ 
        status: "Confirmed" 
      } as any).eq("id", id);
      if (error) throw error;

      await runGlobalReallocation();
      await fetchPatientsList();
      toast.success("Patient admission approved");
    } catch {
      toast.error("Approval failed");
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList, runGlobalReallocation]);

  const handleReject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
      await fetchPatientsList();
      toast.success("Patient application rejected");
    } catch {
      toast.error("Rejection failed");
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList]);

  const handleManualReallocation = useCallback(async () => {
    setLoading(true);
    try {
      const { data: allPatients } = await supabase.from("patients").select("*");
      const waitingPatients = (allPatients || []).filter((p: any) => p.status === "Waiting");

      if (waitingPatients.length === 0) {
        toast.info("No patients in waiting list");
        return;
      }

      // Bulk update Status to Confirmed to allow bed allocation
      const { error } = await supabase
        .from("patients")
        .update({ status: "Confirmed" } as any)
        .in("id", waitingPatients.map(p => p.id));

      if (error) throw error;

      await runGlobalReallocation();
      await fetchPatientsList();
      toast.success(`Manual allocation processed for ${waitingPatients.length} patients`);
    } catch (err: unknown) {
      toast.error("Manual allocation failed");
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList, runGlobalReallocation]);

  const handleRemovePatient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data: patientToRemove } = await supabase.from("patients").select("*").eq("id", id).single();
      const { error: deleteError } = await supabase.from("patients").delete().eq("id", id);
      if (deleteError) throw deleteError;

      if (patientToRemove) logHistory(patientToRemove, "Removed");

      await runGlobalReallocation();
      await fetchPatientsList();
      toast.success("Patient removed successfully");
    } catch (err: unknown) {
      toast.error("Failed to remove patient: " + ((err as Error)?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetchPatientsList, logHistory]);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Re-fetch patients from DB
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const freshPatients = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        severity: p.severity,
        needsICU: p.needs_icu,
        assignedBed: p.assigned_bed,
        bedNumber: p.bed_number,
        floorNumber: p.floor_number,
        oxygenLevel: p.oxygen_level,
        heartRate: p.heart_rate,
        createdAt: p.created_at,
      }));

      // Re-read history from localStorage
      const saved = localStorage.getItem("hospital_history");
      const storedHistory: HistoryEntry[] = saved ? JSON.parse(saved) : [];

      // Backfill any patients not yet in history
      const existingIds = new Set(storedHistory.map((h) => h.patientId).filter(Boolean));
      const newEntries: HistoryEntry[] = freshPatients
        .filter((p) => !existingIds.has(p.id))
        .map((p) => ({
          id: Math.random().toString(36).substr(2, 9),
          patientId: p.id,
          name: p.name,
          severity: p.severity,
          needsICU: p.needsICU,
          assignedBed: p.assignedBed,
          bedNumber: p.bedNumber,
          floorNumber: p.floorNumber,
          actionType: "Added" as const,
          timestamp: p.createdAt,
        }));

      const merged = [...newEntries, ...storedHistory];
      localStorage.setItem("hospital_history", JSON.stringify(merged.slice(0, 100)));
      setHistory(merged.slice(0, 100));
      setPatients(freshPatients);
      toast.success("Patient history refreshed successfully");
    } catch {
      toast.error("Failed to refresh history");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setLoading(true);
    try {
      const { data: patientsToClear } = await supabase.from("patients").select("*").neq("id", "00000000-0000-0000-0000-000000000000");
      const { error } = await supabase.from("patients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      
      if (patientsToClear) {
        patientsToClear.forEach(p => logHistory(p, "Removed"));
      }

      setPatients([]);
      toast.success("System reset successfully");
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  }, [logHistory]);

  return (
    <PatientContext.Provider value={{
      patients,
      history,
      loading,
      initialLoading,
      icuUsed,
      normalUsed,
      waitingCount,
      icuAvailable,
      normalAvailable,
      fetchPatientsList,
      refreshHistory,
      handleAllocate,
      handleUpdatePatient,
      handleApprove,
      handleReject,
      handleManualReallocation,
      handleRemovePatient,
      handleReset
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientProvider");
  }
  return context;
};
