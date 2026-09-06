import React, { useState, useRef, useEffect } from "react";
import { api } from "../api/api";

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  onOpenIssueBookWithPreset,
  onViewBookDetails
}) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("nscc_gemini_api_key") || "");
  const [backendConfigured, setBackendConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    api.getAiStatus()
      .then(res => { if (res && res.configured) setBackendConfigured(true); })
      .catch(() => {});
  }, [isOpen]);

  const isGeminiActive = Boolean(apiKey || backendConfigured);

  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi, I am Athena, your LibNexus AI assistant.\n\nAsk me about books in our catalog, get intelligent reading recommendations, or explore topics you are studying.",
    recommendations: [],
  }]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What CS books do you have?",
    "Recommend something like Clean Code",
    "Suggest a sci-fi novel",
    "Talk to me about 1984",
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    setApiKey(cleanKey);
    cleanKey ? localStorage.setItem("nscc_gemini_api_key", cleanKey) : localStorage.removeItem("nscc_gemini_api_key");
    setShowSettings(false);
  };

  const handleClearKey = () => {
    setTempApiKey(""); setApiKey("");
    localStorage.removeItem("nscc_gemini_api_key");
    setShowSettings(false);
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isTyping) return;
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages); setInputPrompt(""); setIsTyping(true);
    try {
      const res = await api.aiChat(query, newMessages.slice(-8), apiKey || null);
      if (res.success) {
        setMessages(prev => [...prev, { role: "assistant", content: res.reply, recommendations: res.recommendations || [] }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again.", recommendations: [] }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Could not reach Athena: ${err.message || "Network error"}`, recommendations: [] }]);
    } finally { setIsTyping(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-overlay" onClick={onClose}>
      <aside className="ai-panel" onClick={(e) => e.stopPropagation()}>

        <div className="ai-panel-header">
          <div className="ai-panel-brand">
            <div className="ai-logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <p className="ai-panel-name">Athena</p>
              <div className="ai-panel-status">
                <span className={"ai-status-dot " + (isGeminiActive ? "dot-on" : "dot-off")}></span>
                <span className="ai-status-text">{isGeminiActive ? "Gemini Flash · Online" : "AI Offline"}</span>
              </div>
            </div>
          </div>
          <div className="ai-panel-controls">
            <button className={"ai-ctrl-btn " + (showSettings ? "ctrl-active" : "")} onClick={() => { setTempApiKey(apiKey); setShowSettings(!showSettings); }} title="API Settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button className="ai-ctrl-btn" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="ai-settings-pane">
            <p className="settings-pane-title">API Configuration</p>
            <p className="settings-pane-desc">Paste a Gemini API key to activate Athena. Stored locally in your browser only.</p>
            <form onSubmit={handleSaveKey}>
              <div className="key-field-row">
                <input type={showKeyText ? "text" : "password"} className="key-field-input" placeholder="AIzaSy..." value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} />
                <button type="button" className="key-vis-btn" onClick={() => setShowKeyText(!showKeyText)}>
                  {showKeyText
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <div className="settings-pane-footer">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="ai-ext-link">Get a free key at Google AI Studio</a>
                <div className="settings-btn-row">
                  {apiKey && <button type="button" className="btn-key-clear" onClick={handleClearKey}>Clear</button>}
                  <button type="submit" className="btn-key-save">Save</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="ai-quick-strip">
          {quickPrompts.map((p, i) => (
            <button key={i} className="ai-quick-chip" onClick={() => handleSend(p)} disabled={isTyping}>{p}</button>
          ))}
        </div>

        <div className="ai-messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={"ai-msg-row " + (msg.role === "user" ? "row-user" : "row-ai")}>
              <div className={"ai-msg-bubble " + (msg.role === "user" ? "bubble-user" : "bubble-ai")}>
                <div className="bubble-text" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="ai-rec-list">
                    <span className="ai-rec-label">Available in library</span>
                    {msg.recommendations.map((b) => (
                      <div key={b.id} className="ai-rec-row">
                        <div className="ai-rec-info">
                          <span className="ai-rec-title">{b.title}</span>
                          <span className="ai-rec-meta">{b.author} · {b.category}</span>
                        </div>
                        <div className="ai-rec-actions">
                          <span className={"ai-rec-stock " + (b.available_quantity > 0 ? "stock-yes" : "stock-no")}>
                            {b.available_quantity > 0 ? b.available_quantity + " left" : "Out"}
                          </span>
                          {b.available_quantity > 0 && onOpenIssueBookWithPreset && (
                            <button className="ai-rec-borrow" onClick={() => { onClose(); onOpenIssueBookWithPreset(b); }}>Borrow</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="ai-msg-row row-ai">
              <div className="ai-msg-bubble bubble-ai typing-bubble">
                <span className="t-dot"></span><span className="t-dot"></span><span className="t-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-bar">
          <input type="text" className="ai-input-field" placeholder="Ask Athena anything..." value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            disabled={isTyping}
          />
          <button className="ai-submit-btn" onClick={() => handleSend()} disabled={isTyping || !inputPrompt.trim()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

      </aside>
    </div>
  );
}
