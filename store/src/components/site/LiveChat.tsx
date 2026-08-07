import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Msg { from: "user" | "agent"; text: string; t: number }
const STORAGE = "aimo.chat";
const SUPPORT_EMAIL = "ahmad.m.nassarr@gmail.com";

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setMsgs(JSON.parse(raw));
      else setMsgs([{ from: "agent", text: "Welcome to AimoWear. How can we help you today?", t: Date.now() }]);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(msgs)); } catch {} }, [msgs]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, open]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((p) => [...p, { from: "user", text, t: Date.now() }]);
    setInput("");
    setTimeout(() => {
      setMsgs((p) => [...p, {
        from: "agent",
        text: `Thanks — a member of our team will reply shortly. For urgent inquiries email ${SUPPORT_EMAIL}.`,
        t: Date.now(),
      }]);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Live chat"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-white grid place-items-center shadow-2xl hover:brightness-110 transition"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm bg-background border border-border shadow-2xl flex flex-col overflow-hidden" style={{ height: "min(70vh, 520px)" }}>
          <div className="bg-surface border-b border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">AimoWear Support</p>
            <p className="text-xs text-muted-foreground mt-1">We typically reply within minutes</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 text-sm ${m.from === "user" ? "bg-primary text-white" : "bg-surface border border-border"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-2 text-[10px] uppercase tracking-widest text-muted-foreground text-center">
            or email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary">{SUPPORT_EMAIL}</a>
          </div>
          <form onSubmit={send} className="flex border-t border-border">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1 bg-transparent px-4 py-3 text-sm outline-none" />
            <button type="submit" className="px-4 text-primary hover:text-white" aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
