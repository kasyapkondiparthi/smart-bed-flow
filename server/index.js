import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to the .env in the root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Local in-memory patients list fallback
let localPatients = [
  {
    id: "patient-1",
    name: "John Doe",
    severity: "Moderate",
    needs_icu: false,
    assigned_bed: "Normal",
    bed_number: "N-1",
    floor_number: 2,
    oxygen_level: 97,
    heart_rate: 72,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: "Confirmed"
  },
  {
    id: "patient-2",
    name: "Jane Smith",
    severity: "Critical",
    needs_icu: true,
    assigned_bed: "ICU",
    bed_number: "ICU-1",
    floor_number: 1,
    oxygen_level: 89,
    heart_rate: 104,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    status: "Confirmed"
  },
  {
    id: "patient-3",
    name: "Alice Johnson",
    severity: "Low",
    needs_icu: false,
    assigned_bed: "Waiting",
    bed_number: null,
    floor_number: null,
    oxygen_level: 98,
    heart_rate: 68,
    created_at: new Date().toISOString(),
    status: "Waiting"
  }
];

const safeDb = {
  async getPatients() {
    try {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.warn("⚠️ Supabase connection failed. Falling back to backend memory.");
      return { data: localPatients, error: null };
    }
  },

  async insertPatient(patient) {
    try {
      const { data, error } = await supabase.from("patients").insert([patient]).select();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.warn("⚠️ Supabase connection failed. Falling back to backend memory.");
      const newPatient = {
        id: "local-" + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...patient
      };
      localPatients.push(newPatient);
      return { data: [newPatient], error: null };
    }
  },

  async removePatientByName(namePattern) {
    try {
      const { data, error } = await supabase.from("patients").delete().ilike("name", namePattern);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.warn("⚠️ Supabase connection failed. Falling back to backend memory.");
      const normalizedPattern = namePattern.replace(/%/g, "").toLowerCase();
      localPatients = localPatients.filter(p => !p.name.toLowerCase().includes(normalizedPattern));
      return { data: null, error: null };
    }
  },

  async resetAll() {
    try {
      const { error } = await supabase.from("patients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn("⚠️ Supabase connection failed. Falling back to backend memory.");
      localPatients = [];
      return { success: true };
    }
  }
};

const app = express();
app.use(cors());
app.use(express.json());

const handleAction = async (action) => {
  console.log("🛠 Executing Action:", action.type, action.payload);
  try {
    switch (action.type) {
      case "add_patient": {
        const { name, severity, needsICU } = action.payload;
        
        // Normalize Severity to Match Postgres Enum ('Critical', 'Moderate', 'Low')
        const normalizedSeverity = severity ? (severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()) : "Low";
        const finalSeverity = ["Critical", "Moderate", "Low"].includes(normalizedSeverity) ? normalizedSeverity : "Low";

        console.log("💾 Inserting patient via DB...");
        const { data, error } = await safeDb.insertPatient({
          name: name?.trim() || "Unknown AI Patient",
          severity: finalSeverity,
          needs_icu: !!needsICU,
          assigned_bed: "Waiting",
          oxygen_level: 95,
          heart_rate: 75
        });

        if (error) throw error;
        return { success: true, data };
      }

      case "remove_patient": {
        const { data, error } = await safeDb.removePatientByName(`%${action.payload.name}%`);
        if (error) throw error;
        return { success: true, data };
      }

      case "reset": {
        try {
          const response = await fetch(
            `${process.env.VITE_SUPABASE_URL}/functions/v1/allocate`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
                "apikey": process.env.VITE_SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
              }
            }
          );
          if (!response.ok) throw new Error("Reset failed");
          return await response.json();
        } catch (e) {
          console.warn("⚠️ Reset edge function failed, falling back to local reset.");
          await safeDb.resetAll();
          return { success: true };
        }
      }

      default:
        return { error: "Unknown action" };
    }
  } catch (err) {
    console.error("❌ Action Error:", err.message);
    return { error: err.message };
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Smart Hospital System"
        },
        body: JSON.stringify({
          model: process.env.MODEL || "openai/gpt-4o-mini",
          messages
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(500).json({ error: data });
    }

    const aiReply = data.choices[0].message.content;
    
    // Detect and execute actions
    const actionMatch = aiReply.match(/\[ACTION: (.*?)\]/);
    let actionResult = null;
    if (actionMatch) {
      try {
        const action = JSON.parse(actionMatch[1]);
        actionResult = await handleAction(action);
      } catch (e) {
        console.error("Action Parse Error:", e);
      }
    }

    res.json({
      ...data,
      actionExecuted: !!actionResult && !actionResult.error,
      actionError: actionResult?.error || null
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.send("API Running");
});

// ADD PATIENT
app.post("/add-patient", async (req, res) => {
  const { name, severity, needs_icu, phone, oxygen_level, heart_rate } = req.body;

  const { data, error } = await safeDb.insertPatient({ 
    name, 
    severity, 
    needs_icu, 
    phone, 
    assigned_bed: "Waiting", 
    oxygen_level: oxygen_level || 95, 
    heart_rate: heart_rate || 75,
    status: severity === "Critical" ? "Confirmed" : "Waiting"
  });

  if (error) return res.status(400).json(error);

  res.json({ success: true, data });
});

// GET PATIENTS
app.get("/patients", async (req, res) => {
  const { data, error } = await safeDb.getPatients();

  if (error) return res.status(400).json(error);

  res.json(data);
});

const PORT = process.env.PORT || 5050;

// Serve frontend in production
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

// Catch-all to serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
