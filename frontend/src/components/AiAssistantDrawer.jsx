import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/api';

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  onOpenIssueBookWithPreset,
  onViewBookDetails
}) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nscc_gemini_api_key') || '');
  const [backendConfigured, setBackendConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    api.getAiStatus()
      .then(res => {
        if (res && res.configured) {
          setBackendConfigured(true);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const isGeminiActive = Boolean(apiKey || backendConfigured);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hey there! I'm **Athena**, your library friend here at NSCC! ☕📖\n\nI love talking about books! Tell me about what you've been reading lately, what you loved (or hated!) about it, or what kind of vibe you're in the mood for. We can dissect your favorite plots, debate character arcs, or find the perfect book waiting for you on our college shelves.\n\nWhat's on your reading mind today?",
      recommendations: [],
      engine: "Gemini Flash (Google AI Active)"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "I just finished reading a great book!",
    "Recommend a book like Clean Code",
    "What computer science books do we have on shelf?",
    "Suggest me a thrilling sci-fi novel",
    "Let's talk about 1984 vs Brave New World"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    setApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('nscc_gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('nscc_gemini_api_key');
    }
    setShowSettings(false);
  };

  const handleClearKey = () => {
    setTempApiKey('');
    setApiKey('');
    localStorage.removeItem('nscc_gemini_api_key');
    setShowSettings(false);
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isTyping) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const historyContext = newMessages.slice(-8);
      const res = await api.aiChat(query, historyContext, apiKey || null);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            recommendations: res.recommendations || [],
            engine: res.engine
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "⚠️ I stumbled for a moment! Please ask me again or check our connection.",
            recommendations: []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error communicating with Athena: ${err.message || 'Network error'}`,
          recommendations: []
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-drawer-overlay" onClick={onClose}>
      <aside className="ai-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="ai-drawer-header">
          <div className="ai-drawer-brand">
            <div className="ai-avatar-badge">
              <span style={{ fontSize: '1.25rem' }}>☕</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 className="ai-drawer-title">Athena</h3>
                <span className="ai-friend-badge">Library Friend</span>
              </div>
              <span className="ai-drawer-subtitle">
                {isGeminiActive ? (
                  <span className="status-live-pill gemini-active">
                    <span className="dot-live-green"></span> Gemini Flash (Online)
                  </span>
                ) : (
                  <span className="status-live-pill" title="Click ⚙️ to enable Gemini Flash">
                    ☕ Companion Engine
                  </span>
                )}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              className={`ai-settings-btn ${showSettings ? 'active' : ''} ${isGeminiActive ? 'has-key' : ''}`}
              onClick={() => {
                setTempApiKey(apiKey);
                setShowSettings(!showSettings);
              }}
              title={isGeminiActive ? "Gemini Flash Connected (Click to edit key)" : "Configure Gemini Flash API Key"}
            >
              ⚙️
            </button>
            <button className="ai-close-btn" onClick={onClose} aria-label="Close Assistant">
              &times;
            </button>
          </div>
        </div>

        {/* Gemini API Key Settings Panel */}
        {showSettings && (
          <div className="ai-key-settings-panel">
            <div className="settings-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <strong>Gemini 2.0 Flash API Setup</strong>
              </div>
              <button className="panel-close-x" onClick={() => setShowSettings(false)}>&times;</button>
            </div>
            <p className="settings-desc">
              Connect Google's <strong>Gemini 2.0 Flash</strong> model to talk naturally about any book you've read, dive deep into plots and themes, and get reading recommendations!
            </p>
            <form onSubmit={handleSaveKey} className="settings-form">
              <div className="key-input-wrapper">
                <input
                  type={showKeyText ? "text" : "password"}
                  className="key-text-input"
                  placeholder="Paste GEMINI_API_KEY (AIzaSy...)"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="key-toggle-view"
                  onClick={() => setShowKeyText(!showKeyText)}
                >
                  {showKeyText ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="settings-actions">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="get-key-link"
                >
                  Get free key at Google AI Studio ↗
                </a>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {apiKey && (
                    <button type="button" className="btn-key-clear" onClick={handleClearKey}>
                      Clear
                    </button>
                  )}
                  <button type="submit" className="btn-key-save">
                    Save Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="ai-prompt-chips">
          <span className="chips-label">Chat starters:</span>
          <div className="chips-scroll">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="prompt-chip"
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="ai-messages-container">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-message-row ${msg.role === 'user' ? 'msg-user-row' : 'msg-ai-row'}`}
            >
              <div className={`ai-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                {msg.engine && msg.role === 'assistant' && (
                  <div className="bubble-engine-badge">
                    <span>✨ {msg.engine}</span>
                  </div>
                )}
                <div className="ai-bubble-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>

                {/* Embedded Book Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="ai-recommendations-grid">
                    <span className="rec-heading">📚 Available on Library Shelves:</span>
                    {msg.recommendations.map((b) => (
                      <div key={b.id} className="rec-book-card">
                        <div className="rec-book-info">
                          <span className="rec-book-title">{b.title}</span>
                          <span className="rec-book-meta">{b.author} &bull; {b.category}</span>
                        </div>
                        <div className="rec-book-actions">
                          <span className={`badge ${b.available_quantity > 0 ? 'badge-available' : 'badge-outofstock'}`}>
                            {b.available_quantity > 0 ? `${b.available_quantity} on shelf` : 'Checked Out'}
                          </span>
                          {b.available_quantity > 0 && onOpenIssueBookWithPreset && (
                            <button
                              className="btn-rec-issue"
                              onClick={() => {
                                onClose();
                                onOpenIssueBookWithPreset(b);
                              }}
                            >
                              Borrow
                            </button>
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
            <div className="ai-message-row msg-ai-row">
              <div className="ai-bubble bubble-ai typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Athena is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="ai-input-bar">
          <input
            type="text"
            className="ai-chat-input"
            placeholder="Talk about books you read, ask for recommendations..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isTyping}
          />
          <button
            className="ai-send-btn"
            onClick={() => handleSend()}
            disabled={isTyping || !inputPrompt.trim()}
            title="Send Message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </aside>
    </div>
  );
}
