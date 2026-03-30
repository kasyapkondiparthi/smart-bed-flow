import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ICU_TOTAL = 10;
const NORMAL_TOTAL = 30;

const severityOrder = { Critical: 0, Moderate: 1, Low: 2 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
       return new Response(JSON.stringify({ error: "Supabase credentials missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const body = await req.json();
      
      let insertedPatient = null;

      if (body.action === "remove") {
        if (!body.id) {
          return new Response(JSON.stringify({ error: "Patient ID is required for removal" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error: deleteError } = await supabase.from("patients").delete().eq("id", body.id);
        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const { name, severity, needsICU, oxygenLevel, heartRate } = body;

        // Validate
        if (!name || typeof name !== "string" || name.trim().length === 0) {
          return new Response(JSON.stringify({ error: "Patient name is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 1. Insert the new patient first (initially Waiting)
        const { data: newPat, error: insertError } = await supabase
          .from("patients")
          .insert({
            name: name.trim(),
            severity: severity || "Low",
            needs_icu: !!needsICU,
            assigned_bed: "Waiting",
            oxygen_level: oxygenLevel,
            heart_rate: heartRate,
          })
          .select()
          .single();

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        insertedPatient = newPat;
      }

      // 2. Perform Global Priority-Based Re-allocation
      const { data: allPatients } = await supabase.from("patients").select("*").order("created_at", { ascending: true });
      const patients = allPatients || [];

      interface PatientRow {
        id: string;
        assigned_bed: string;
        severity: string;
        created_at: string;
        needs_icu: boolean;
        bed_number?: string;
        floor_number?: number;
      }

      // Current occupancy
      const occupants = patients.filter((p: PatientRow) => p.assigned_bed !== "Waiting");
      const icuUsed = occupants.filter((p: PatientRow) => p.assigned_bed === "ICU").length;
      const normalUsed = occupants.filter((p: PatientRow) => p.assigned_bed === "Normal").length;

      const occupiedICU = new Set(occupants.filter((p: PatientRow) => p.assigned_bed === "ICU" && p.bed_number).map((p: PatientRow) => p.bed_number));
      const occupiedNormal = new Set(occupants.filter((p: PatientRow) => p.assigned_bed === "Normal" && p.bed_number).map((p: PatientRow) => p.bed_number));

      let icuAvailable = ICU_TOTAL - icuUsed;
      let normalAvailable = NORMAL_TOTAL - normalUsed;

      // Waiting list sorted by priority
      const severityMap: Record<string, number> = { Critical: 0, Moderate: 1, Low: 2 };
      const waitingList = patients
        .filter((p: PatientRow) => p.assigned_bed === "Waiting")
        .sort((a: PatientRow, b: PatientRow) => {
          if (severityMap[a.severity] !== severityMap[b.severity]) {
            return severityMap[a.severity] - severityMap[b.severity];
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

      // 3. Assign beds
      const updates = [];
      for (const p of waitingList) {
        let assigned: string | null = null;
        let bed_number: string | null = null;
        let floor_number: number | null = null;

        if (p.needs_icu && icuAvailable > 0) {
          assigned = "ICU";
          icuAvailable--;
        } else if (!p.needs_icu && normalAvailable > 0) {
          assigned = "Normal";
          normalAvailable--;
        } else if (!p.needs_icu && normalAvailable <= 0 && icuAvailable > 0) {
          assigned = "ICU";
          icuAvailable--;
        }

        if (assigned === "ICU") {
          for (let i = 1; i <= ICU_TOTAL; i++) {
            const bedStr = `ICU-${i}`;
            if (!occupiedICU.has(bedStr)) {
              bed_number = bedStr;
              floor_number = 1; // ICU acts on Floor 1
              occupiedICU.add(bedStr);
              break;
            }
          }
        } else if (assigned === "Normal") {
          for (let i = 1; i <= NORMAL_TOTAL; i++) {
            const bedStr = `N-${i}`;
            if (!occupiedNormal.has(bedStr)) {
              bed_number = bedStr;
              floor_number = 2; // Normal wards on Floor 2
              occupiedNormal.add(bedStr);
              break;
            }
          }
        }

        if (assigned) {
          updates.push(supabase.from("patients").update({ 
            assigned_bed: assigned,
            bed_number,
            floor_number
          }).eq("id", p.id));
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      // Final state of the patient
      let finalPatient = null;
      if (insertedPatient) {
        const { data } = await supabase.from("patients").select("*").eq("id", insertedPatient.id).single();
        finalPatient = data;
      }

      return new Response(JSON.stringify({ patient: finalPatient, success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const { error } = await supabase.from("patients").delete().not("id", "is", null);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ message: "System reset successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
     const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
