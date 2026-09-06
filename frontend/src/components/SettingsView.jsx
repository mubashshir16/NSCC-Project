import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

export default function SettingsView({
  isBackendOnline,
  userRole,
  setUserRole,
  onOpenAi
}) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nscc_gemini_api_key') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiEngineStatus, setAiEngineStatus] = useState('Checking...');

  useEffect(() => {
    api.getAiStatus()
      .then((res) => {
        if (res && res.engine) {
          setAiEngineStatus(res.engine);
        } else {
          setAiEngineStatus('Local Companion Engine');
        }
      })
      .catch(() => {
        setAiEngineStatus('Offline');
      });
  }, []);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem('nscc_gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('nscc_gemini_api_key');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page animate-fade-in-up">
      <div className="page-header-flex">
        <div>
          <h2 className="page-heading">System Settings &amp; Configuration</h2>
          <p className="page-subtitle">Manage AI engine connectivity, database parameters, and portal access role.</p>
        </div>
      </div>

      <div className="settings-cards-stack">
        {/* Card 1: User Role Preference */}
        <div className="settings-card">
          <h3 className="settings-card-title">Portal Access Role</h3>
          <p className="settings-card-desc">Switch between Librarian Administrator and Student Member modes.</p>
          <div className="role-selector-row">
            <button
              className={`role-choice-btn ${userRole === 'librarian' ? 'active' : ''}`}
              onClick={() => setUserRole('librarian')}
            >
              <span className="role-icon">👨‍💼</span>
              <div className="role-text">
                <strong>Librarian / Administrator</strong>
                <span>Full catalog CRUD, issue & return approvals, reports</span>
              </div>
            </button>
            <button
              className={`role-choice-btn ${userRole === 'student' ? 'active' : ''}`}
              onClick={() => setUserRole('student')}
            >
              <span className="role-icon">👨‍🎓</span>
              <div className="role-text">
                <strong>Student / Member</strong>
                <span>Browse book collection, view my borrowed books, AI companion</span>
              </div>
            </button>
          </div>
        </div>

        {/* Card 2: Gemini Flash AI Integration */}
        <div className="settings-card">
          <div className="card-title-row">
            <h3 className="settings-card-title">Gemini 2.0 / 3.6 Flash AI Configuration</h3>
            <span className="ai-engine-badge">Active Engine: {aiEngineStatus}</span>
          </div>
          <p className="settings-card-desc">
            Athena uses Google Gemini Flash to discuss books, provide personalized reading recommendations, and answer campus queries.
          </p>

          <form onSubmit={handleSaveApiKey} className="settings-key-form">
            <div className="key-input-wrapper-lg">
              <input
                type="password"
                className="settings-key-input"
                placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button type="submit" className="btn-save-key-lg">
                Save Key
              </button>
            </div>
            {savedSuccess && (
              <p className="key-success-msg">✓ Gemini API key updated and stored in browser session!</p>
            )}
            <div className="key-help-row">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="ai-studio-link"
              >
                Get a free API key at Google AI Studio &rarr;
              </a>
              <button type="button" className="btn-test-ai" onClick={onOpenAi}>
                Test Chat with Athena
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: Database & Architecture Health */}
        <div className="settings-card">
          <h3 className="settings-card-title">Database &amp; Tech Stack Architecture</h3>
          <p className="settings-card-desc">Verified PostgreSQL relational storage specifications.</p>
          <div className="db-specs-grid">
            <div className="db-spec-item">
              <span className="db-spec-key">Database Engine</span>
              <span className="db-spec-val">PostgreSQL 16</span>
            </div>
            <div className="db-spec-item">
              <span className="db-spec-key">Database Name</span>
              <span className="db-spec-val font-mono">library_db</span>
            </div>
            <div className="db-spec-item">
              <span className="db-spec-key">Driver Library</span>
              <span className="db-spec-val font-mono">node-postgres (pg)</span>
            </div>
            <div className="db-spec-item">
              <span className="db-spec-key">Standard Loan Policy</span>
              <span className="db-spec-val">14 Days Standard Circulation</span>
            </div>
            <div className="db-spec-item">
              <span className="db-spec-key">Connection Status</span>
              <span className={`db-spec-val font-bold ${isBackendOnline ? 'text-success' : 'text-danger'}`}>
                {isBackendOnline ? 'Connected & Healthy (Port 5000)' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
