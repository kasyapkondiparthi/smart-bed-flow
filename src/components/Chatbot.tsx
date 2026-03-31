import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/context/PatientContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PatientInput } from "./PatientForm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isAnalyzing?: boolean;
}

const SUGGESTIONS = [
  "Add critical patient Ram ICU",
  "Show ICU beds",
  "How many patients waiting?",
  "Show system stats",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: "Hello! I am your Neural AI Hospital Assistant. I can help you manage bed allocations with natural language and voice commands. Try 'Add patient Alex critical ICU' or 'Show ICU beds'.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [lastPatient, setLastPatient] = useState<PatientInput | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const {
    handleAllocate,
    handleReset,
    fetchPatientsList,
    icuAvailable,
    normalAvailable,
    patients,
  } = usePatients();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSendVoice(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        toast.error("Speech recognition failed. Try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (!isTTSEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error("Speech recognition is not supported in this browser.");
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const parseCommand = (text: string) => {
    const lower = text.toLowerCase();

    // extract name
    const nameAfterKeyword = text.match(/(?:patient|named|add|admit)\s+([A-Z][a-z]+)/i);
    const capitalizedWord = text.match(/\b([A-Z][a-z]{1,}(?!cu))\b/);
    const extractedName = nameAfterKeyword
      ? nameAfterKeyword[1]
      : capitalizedWord
      ? capitalizedWord[1]
      : text.split(" ").find(w => w.length > 2 && !['add', 'the', 'icu', 'critical', 'moderate', 'patient', 'named', 'show', 'how', 'many', 'reset', 'system'].includes(w.toLowerCase())) || "Ram";

    if (lower.includes("add") || lower.includes("admit") || lower.includes("new patient") || lower.includes("assign")) {
      return {
        type: "add_patient",
        data: {
          name: extractedName,
          severity: lower.includes("critical") ? "Critical" : lower.includes("moderate") ? "Moderate" : "Low",
          needsICU: lower.includes("icu"),
        },
      };
    }

    if (lower.includes("stats") || lower.includes("how many") || lower.includes("summary") || lower.includes("status") || lower.includes("beds") || lower.includes("occupancy")) {
      return { type: "get_stats" };
    }

    if (lower.includes("reset") || lower.includes("clear") || lower.includes("restart")) {
      return { type: "reset" };
    }

    return { type: "unknown" };
  };

  const handleAction = async (action: any) => {
    switch (action.type) {
      case "add_patient":
        const { error: addError } = await supabase.from("patients").insert([{
          name: action.data.name,
          severity: action.data.severity,
          needs_icu: action.data.needsICU,
          assigned_bed: "Waiting"
        }]);
        if (addError) throw addError;
        return { message: "Patient added successfully" };

      case "get_stats":
        const { data } = await supabase.from("patients").select("*");
        return {
          total: data?.length || 0,
          critical: data?.filter((p: any) => p.severity === "Critical").length || 0,
          waiting: data?.filter((p: any) => p.assigned_bed === "Waiting").length || 0,
        };

      case "reset":
        const { error: resetError } = await supabase.from("patients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (resetError) throw resetError;
        return { message: "System reset successfully" };

      default:
        return { message: "Unknown action" };
    }
  };

  const replies = {
    add: (p: any) => 
      `🧠 AI Analysis Complete:\nPatient ${p.name} classified as ${p.severity} severity.\nAllocating to ${p.needsICU ? "ICU ward (Floor 1)" : "General ward (Floor 2)"} — bed assigned successfully.`,
    icu: (stats: any) => 
      `🏥 ICU Bed Status:\n• Available: ${stats.icuAvailable} beds\n• In Use: ${stats.icuUsed} beds`,
    waiting: (stats: any) => 
      `⏳ Waiting Queue:\n• Patients waiting: ${stats.waiting}\nI recommend checking triage priority for faster allocation.`,
    stats: (stats: any) =>
      `📊 Live System Summary:\n• ICU Available: ${stats.icuAvailable}\n• Normal Available: ${stats.normalAvailable}\n• Total Patients: ${stats.total}\n• Waiting Queue: ${stats.waiting}`,
    reset: () => `⚠ Security override confirmed. All patient records cleared. System is ready for new shift.`,
    unknown: () => "I'm monitoring the hospital engine. Try: 'Add patient Ram critical ICU', 'Show ICU beds', 'System stats', or 'Reset system'."
  };

  const handleSendVoice = async (voiceInput: string) => {
    if (!voiceInput.trim()) return;
    await processInput(voiceInput);
  };

  const sendToAI = async (messages: { role: string; content: string }[]) => {
    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) throw new Error("AI Proxy unreachable");
      const data = await res.json();
      return {
        content: data.choices?.[0]?.message?.content || "I am processing your request...",
        actionExecuted: data.actionExecuted,
        actionError: data.actionError
      };
    } catch (err) {
      console.error("AI Error:", err);
      return {
        content: "System Error: Neural link offline. Please try again later.",
        actionExecuted: false,
        actionError: (err as Error).message
      };
    }
  };

  const processInput = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    // 1. Add user message to UI and History
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    // Initial "Analyzing..." message
    const analysisId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      id: analysisId,
      role: "assistant",
      text: "🤖 AI is analyzing hospital data vectors...",
      isAnalyzing: true
    }]);

    // 2. Perform direct system action if matched
    const command = parseCommand(userMessage);
    let aiReply = "";
    let actionExecuted = false;
    let actionError = null;

    if (command.type !== "unknown") {
      try {
        const result: any = await handleAction(command);
        actionExecuted = true;
        
        if (command.type === "add_patient") {
          aiReply = `✅ Patient ${command.data.name} added successfully to the neural queue.`;
        } else if (command.type === "get_stats") {
          aiReply = `📊 Live System Stats:\n• Total: ${result.total}\n• Critical: ${result.critical}\n• Waiting: ${result.waiting}`;
        } else if (command.type === "reset") {
          aiReply = result.message;
        }

        // Refresh UI state
        await fetchPatientsList();
      } catch (err: any) {
        actionError = err.message;
        aiReply = `❌ System Error: ${err.message}`;
      }
    } else {
      // 3. Fallback to AI for general conversation
      const history = messages.map(m => ({
        role: m.role,
        content: m.text
      }));
      history.push({ role: "user", content: userMessage });

      const wCount = patients.filter(p => p.assignedBed === "Waiting").length;
      const systemPrompt = `You are the Neural AI System Controller for the Smart Hospital.
Current Hospital State:
• ICU Available: ${icuAvailable}
• Ward Available: ${normalAvailable} 
• Total Patients: ${patients.length}
• Waiting Queue: ${wCount}

You can summarize data or chat. For real operations, the system already handled structured commands. Use natural language to complement the experience.`;

      const aiResponse = await sendToAI([
        { role: "system", content: systemPrompt },
        ...history
      ]);
      aiReply = aiResponse.content;
      actionExecuted = aiResponse.actionExecuted;
      actionError = aiResponse.actionError;
    }

    setIsTyping(false);
    
    // Update UI with the final reply
    setMessages((prev) => prev.map(m => 
      m.id === analysisId ? { ...m, text: aiReply, isAnalyzing: false } : m
    ));

    if (actionExecuted) {
      toast.success("AI System Action Executed", {
        description: "The hospital database has been updated.",
        icon: <Activity className="w-4 h-4 text-primary" />,
      });
    } else if (actionError) {
      toast.error("AI System Action Failed", {
        description: actionError,
      });
    }

    speak(aiReply);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const textToSend = input;
    setInput("");
    await processInput(textToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await processInput(suggestion);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] border border-blue-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <Bot className="w-7 h-7 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse border border-green-300 shadow-[0_0_10px_rgba(34,197,94,1)]"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col rounded-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-black/40 border-b border-white/10 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Bot className="w-6 h-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-widest uppercase text-sm drop-shadow-md">AI System Assistant</h3>
                <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Local Neural Engine
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                className={`p-2 rounded-full transition-colors ${isTTSEnabled ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-white"}`}
                title={isTTSEnabled ? "Disable Voice" : "Enable Voice Output"}
              >
                {isTTSEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 border border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-br-sm font-medium"
                      : "bg-white/10 border border-white/5 text-slate-200 shadow-sm rounded-bl-sm"
                  } whitespace-pre-line flex flex-col gap-1`}
                >
                  {msg.isAnalyzing && (
                    <span className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest animate-pulse border-b border-blue-400/20 pb-1 mb-1">
                      <Activity className="w-3 h-3" />
                      Analyzing Neural Vectors...
                    </span>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator / Loading indicator */}
            {isTyping && (
                <div className="flex justify-start animate-in fade-in">
                    <div className="bg-white/10 border border-white/5 px-4 py-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Suggestions Chips */}
          <div className="px-4 py-2 flex flex-wrap gap-2 bg-black/20">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1.5 text-slate-400 hover:text-white transition-all transform hover:scale-105 flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                {s}
              </button>
            ))}
          </div>

          {/* Form Input Area */}
          <div className="p-3 bg-black/40 border-t border-white/10">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-xl p-1.5 pl-4 focus-within:ring-1 focus-within:ring-blue-500/50 shadow-inner"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or use voice..."}
                className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0 py-2.5 disabled:opacity-50 font-medium tracking-wide"
                disabled={isTyping}
              />
              
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all ${isListening ? "text-red-400 bg-red-400/20 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.5)]" : "text-slate-400 hover:text-blue-400 hover:bg-white/5"}`}
                disabled={isTyping}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-lg text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
