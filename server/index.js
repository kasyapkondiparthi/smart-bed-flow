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
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

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
        const { data, error } = await supabase.from("patients").insert([{
          name: name?.trim() || "Unknown AI Patient",
          severity: finalSeverity,
          needs_icu: !!needsICU,
          assigned_bed: "Waiting",
          oxygen_level: 95,
          heart_rate: 75
        }]);

        if (error) throw error;
        return { success: true, data };
      }

      case "remove_patient": {
        // Direct table delete is fine for removal, but let's log it
        const { data, error } = await supabase.from("patients").delete().ilike("name", `%${action.payload.name}%`);
        if (error) throw error;
        return { success: true, data };
      }

      case "reset": {
        // Use the Edge Function for reset too
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

const PORT = 5050;
app.listen(PORT, () => console.log(`🚀 Chat Proxy Running on port ${PORT}`));
