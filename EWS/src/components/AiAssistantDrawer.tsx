import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { askAssistantApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  data?: any;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUERIES = [
  { label: "Show high risk students", text: "Show high risk students" },
  { label: "Risk in Kampot", text: "What is the risk in Kampot?" },
  { label: "Average attendance", text: "Show attendance statistics" },
  { label: "Common risk factors", text: "What are the most common risk factors?" },
];

export function AiAssistantDrawer({ isOpen, onClose }: AiAssistantDrawerProps) {
  const { lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: lang === "en" 
            ? "Hello! I am your EduGuard EWS Assistant. I can help query student metrics, geographic risk levels, and intervention statistics. Try selecting one of the suggested queries below!" 
            : "សួស្តី! ខ្ញុំជាជំនួយការ EduGuard EWS របស់អ្នក។ ខ្ញុំអាចជួយសួរទិន្នន័យសិស្ស កម្រិតហានិភ័យតាមតំបន់ និងស្ថិតិអន្តរាគមន៍។ សាកល្បងជ្រើសរើសសំណួរគំរូខាងក្រោម!",
          timestamp: new Date()
        }
      ]);
    }
  }, [lang, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await askAssistantApi(textToSend);
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "assistant",
        text: res.response,
        timestamp: new Date(),
        data: res.data
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "assistant",
        text: lang === "en" 
          ? "Sorry, I encountered an error pulling data from the EWS database. Please verify the backend is running." 
          : "សូមទោស ខ្ញុំបានជួបប្រទះបញ្ហាក្នុងការទាញទិន្នន័យពី EWS database។ សូមពិនិត្យមើលថាតើ backend កំពុងដំណើរការដែរឬទេ។",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold rendering (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIdx} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Bullets rendering
      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        // Strip off the bullet symbol
        const cleanLine = line.trim().replace(/^[•\-]\s*/, "");
        // Split this bullet for bold tags
        const bulletParts = cleanLine.split(/(\*\*.*?\*\*)/g);
        const renderedBulletParts = bulletParts.map((bp, bpIdx) => {
          if (bp.startsWith("**") && bp.endsWith("**")) {
            return <strong key={bpIdx} className="font-bold text-foreground">{bp.slice(2, -2)}</strong>;
          }
          return bp;
        });

        return (
          <li key={idx} className="ml-4 list-disc pl-1 mt-1.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
            {renderedBulletParts}
          </li>
        );
      }

      return (
        <p key={idx} className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed min-h-[1em]">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />

          {/* Chat Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-card shadow-2xl sm:max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-sidebar/50">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold">EduGuard AI Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">EWS Engine Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-3 max-w-[85%]",
                      isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-xs",
                      isAssistant 
                        ? "bg-muted/50 border-border text-primary" 
                        : "bg-gradient-primary border-primary text-primary-foreground"
                    )}>
                      {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        isAssistant 
                          ? "bg-muted/40 text-muted-foreground rounded-tl-sm border border-border/40" 
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      )}>
                        {/* Conversational Text */}
                        <div className="space-y-1">{renderMessageContent(msg.text)}</div>

                        {/* Structured Data Table Embed (e.g. Students List) */}
                        {isAssistant && msg.data && msg.data.type === "students" && msg.data.list.length > 0 && (
                          <div className="mt-3.5 rounded-xl border border-border/50 bg-card p-3 shadow-inner overflow-x-auto text-[11px] md:text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                  <th className="pb-1.5 pr-2 font-semibold">Name</th>
                                  <th className="pb-1.5 pr-2 font-semibold">Grade</th>
                                  <th className="pb-1.5 pr-2 font-semibold">Province</th>
                                  <th className="pb-1.5 text-right font-semibold">Risk</th>
                                </tr>
                              </thead>
                              <tbody>
                                {msg.data.list.map((st: any, sIdx: number) => (
                                  <tr key={sIdx} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
                                    <td className="py-2 pr-2 font-medium text-foreground">{st.name}</td>
                                    <td className="py-2 pr-2 text-muted-foreground">G{st.grade}</td>
                                    <td className="py-2 pr-2 text-muted-foreground">{st.province}</td>
                                    <td className="py-2 text-right font-bold text-danger">{st.risk}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      
                      <div className={cn("text-[10px] text-muted-foreground/60 px-1.5", isAssistant ? "text-left" : "text-right")}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-muted/50 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-muted/40 px-4 py-3.5 shadow-sm text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Analyzing database metrics...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Panel */}
            {messages.length === 1 && !loading && (
              <div className="px-5 py-3 border-t border-border bg-sidebar/10">
                <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Quick Queries
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      className="text-left text-xs bg-muted/40 hover:bg-muted/80 text-muted-foreground border border-border/40 rounded-xl px-3 py-2 transition-all active:scale-[0.98]"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="border-t border-border p-4 bg-sidebar/50 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === "en" ? "Ask about high risk students, stats by province..." : "សួរអំពីសិស្សហានិភ័យខ្ពស់ ស្ថិតិតាមខេត្ត..."}
                disabled={loading}
                className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-110 transition-all active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
