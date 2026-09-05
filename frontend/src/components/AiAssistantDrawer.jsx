import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/api';

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  onOpenIssueBookWithPreset,
  onViewBookDetails
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I am **Athena**, your NSCC AI Librarian. Ask me anything about our library catalog, course textbooks, real-time availability, or borrowing policies!",
      recommendations: []
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What books on algorithms do we have?",
    "Recommend a book for software engineering",
    "Is Clean Code currently in stock?",
    "What are the 14-day loan and overdue rules?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isTyping) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const res = await api.aiChat(query, newMessages.slice(-6));
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
            content: "⚠️ I encountered an issue retrieving that information. Please try again.",
            recommendations: []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Unable to communicate with AI service'}`,
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                <path d="M6 14v-1a6 6 0 0 1 12 0v1"></path>
                <rect x="4" y="14" width="16" height="8" rx="2"></rect>
              </svg>
            </div>
            <div>
              <h3 className="ai-drawer-title">Athena &bull; AI Librarian</h3>
              <span className="ai-drawer-subtitle">Catalog-grounded student assistant</span>
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose} aria-label="Close Assistant">
            &times;
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="ai-prompt-chips">
          <span className="chips-label">Try asking:</span>
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
                <div className="ai-bubble-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>

                {/* Embedded Book Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="ai-recommendations-grid">
                    <span className="rec-heading">Catalog Reference(s):</span>
                    {msg.recommendations.map((b) => (
                      <div key={b.id} className="rec-book-card">
                        <div className="rec-book-info">
                          <span className="rec-book-title">{b.title}</span>
                          <span className="rec-book-meta">{b.author} &bull; {b.category}</span>
                        </div>
                        <div className="rec-book-actions">
                          <span className={`badge ${b.available_quantity > 0 ? 'badge-available' : 'badge-outofstock'}`}>
                            {b.available_quantity > 0 ? `${b.available_quantity} Avail` : 'Out of Stock'}
                          </span>
                          {b.available_quantity > 0 && onOpenIssueBookWithPreset && (
                            <button
                              className="btn-rec-issue"
                              onClick={() => {
                                onClose();
                                onOpenIssueBookWithPreset(b);
                              }}
                            >
                              Issue
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
            placeholder="Ask Athena about books, authors, policies..."
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
