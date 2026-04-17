import { useState, useEffect, useRef } from "react";

const MODES = [
  { id: "chat",  icon: "💬", label: "Chat",    color: "#4FFFB0" },
  { id: "write", icon: "✍️",  label: "Write",   color: "#FF6B6B" },
  { id: "code",  icon: "⚡",  label: "Code",    color: "#4FC3F7" },
  { id: "image", icon: "🎨",  label: "Imagine", color: "#FFD54F" },
  { id: "coach", icon: "🧠",  label: "Coach",   color: "#CE93D8" },
];

const STARTERS = {
  chat:  "👋 Hey! I'm SuperMind. Ask me anything.",
  write: "✍️ Give me a topic — I'll write it instantly.",
  code:  "⚡ Drop your coding challenge. I'll build it.",
  image: "🎨 Describe your image idea.",
  coach: "🧠 What are you working toward?",
};

const QUICK = {
  chat:  ["What can you do?", "Give me life advice", "Explain AI"],
  write: ["Write a blog about AI", "Email asking for raise", "Product launch post"],
  code:  ["React login form", "Python web scraper", "REST API in Node"],
  image: ["Futuristic city at sunset", "Robot chef portrait", "Abstract data art"],
  coach: ["I feel stuck", "Help me set goals", "Build my confidence"],
};

function renderMD(text) {
  return text
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;overflow-x:auto;font-family:monospace;font-size:13px;color:#4FC3F7;margin:8px 0">$1</pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 7px;border-radius:4px;font-family:monospace;color:#4FFFB0">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#4FFFB0">›</span><span>$1</span></div>')
    .replace(/\n/g, "<br/>");
}

export default function App() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([{ role: "assistant", content: STARTERS["chat"] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef(null);
  const cur = MODES.find(m => m.id === mode);

  useEffect(() => {
    setMessages([{ role: "assistant", content: STARTERS[mode] }]);
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || msgCount >= 50) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "...", typing: true }]);
    setInput(""); setLoading(true); setMsgCount(c => c + 1);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })), mode }),
    });
    const data = await res.json();
    setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#080810", color:"#fff", fontFamily:"system-ui,sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} textarea{outline:none;resize:none} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(8,8,16,0.95)", backdropFilter:"blur(20px)" }}>
        <div style={{ fontWeight:900, fontSize:20, letterSpacing:-1 }}>super<span style={{ color:cur.color }}>mind</span></div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>{50 - msgCount} free messages left</div>
      </div>

      {/* Modes */}
      <div style={{ display:"flex", gap:6, padding:"10px 14px", overflowX:"auto", borderBottom:"1px solid rgba(255,255,255,0.05)", scrollbarWidth:"none" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{ display:"flex", alignItems:"center", gap:6, background: mode===m.id ? `${m.color}18` : "rgba(255,255,255,0.04)", border:`1px solid ${mode===m.id ? m.color+"44" : "rgba(255,255,255,0.07)"}`, borderRadius:20, padding:"6px 14px", cursor:"pointer", flexShrink:0, color: mode===m.id ? m.color : "rgba(255,255,255,0.45)", fontSize:12, fontWeight:700 }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", justifyContent: msg.role==="user" ? "flex-end" : "flex-start", marginBottom:14, animation:"fadeUp 0.3s ease" }}>
            {msg.role==="assistant" && <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${cur.color},${cur.color}66)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#080810", marginRight:8, flexShrink:0, alignSelf:"flex-end" }}>S</div>}
            <div style={{ maxWidth:"78%", background: msg.role==="user" ? `${cur.color}18` : "rgba(255,255,255,0.05)", border:`1px solid ${msg.role==="user" ? cur.color+"33" : "rgba(255,255,255,0.08)"}`, borderRadius: msg.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding:"11px 15px", fontSize:14, lineHeight:1.6, color:"rgba(255,255,255,0.85)" }}>
              {msg.typing ? "●●●" : <span dangerouslySetInnerHTML={{ __html: renderMD(msg.content) }} />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display:"flex", gap:6, padding:"8px 14px 4px", overflowX:"auto", scrollbarWidth:"none" }}>
        {(QUICK[mode]||[]).map(p => (
          <button key={p} onClick={() => setInput(p)} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", borderRadius:20, padding:"5px 12px", cursor:"pointer", fontSize:11, fontWeight:600, flexShrink:0, whiteSpace:"nowrap" }}>{p}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:"10px 14px 20px" }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-end", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"10px 12px" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Ask SuperMind... (${cur.label} mode)`} rows={1} style={{ flex:1, background:"none", border:"none", color:"#fff", fontSize:14, fontFamily:"inherit", maxHeight:100, overflowY:"auto" }} onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,100)+"px"; }} />
          <button onClick={send} disabled={loading||!input.trim()} style={{ width:36, height:36, borderRadius:9, background: loading||!input.trim() ? "rgba(255,255,255,0.07)" : `linear-gradient(135deg,${cur.color},${cur.color}aa)`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color: loading||!input.trim() ? "rgba(255,255,255,0.3)" : "#080810", fontWeight:900 }}>
            {loading ? <div style={{ width:14, height:14, border:`2px solid rgba(255,255,255,0.2)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
