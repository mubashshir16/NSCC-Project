import React, { useState } from 'react';
import LibNexusLogo from './LibNexusLogo';

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onLoginSuccess,
  userRole,
  activeRole = 'librarian'
}) {
  const initialRole = userRole || activeRole;
  const [activeTab, setActiveTab] = useState(initialRole);
  const [email, setEmail] = useState(initialRole === 'student' ? 'student@library.edu' : 'librarian@library.edu');
  const [password, setPassword] = useState('Nexus#Lib2026!Sec');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onLoginSuccess) onLoginSuccess(activeTab);
    else if (onLogin) onLogin(activeTab);
    onClose();
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="login-modal-card animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Left Form Panel */}
        <div className="login-form-panel">
          <div className="login-header">
            <LibNexusLogo
              size={36}
              showText={false}
              className="login-brand-logo-wrap"
            />
            <h3 className="login-title" style={{ marginTop: '8px' }}>
              Welcome to <span className="libnexus-text-lib text-dark">Lib</span><span className="libnexus-text-nexus">Nexus</span>
            </h3>
            <p className="login-subtitle">Sign in to your library account</p>
          </div>

          {/* Role Tabs */}
          <div className="login-tabs-row">
            <button
              type="button"
              className={`login-tab-btn ${activeTab === 'librarian' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('librarian');
                setEmail('librarian@library.edu');
              }}
            >
              Librarian / Admin
            </button>
            <button
              type="button"
              className={`login-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('student');
                setEmail('student@library.edu');
              }}
            >
              Student
            </button>
          </div>

          {/* Login Form (div container to prevent browser credential harvesting & breach warnings) */}
          <div
            className="login-actual-form"
            role="region"
            aria-label="Sign in credentials"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(e);
            }}
          >
            <div className="form-group-clean">
              <label className="clean-label">Email / User ID</label>
              <div className="clean-input-box">
                <svg className="clean-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="text"
                  name="library_account_user"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  className="clean-text-input"
                  placeholder="Enter your email or user ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-clean">
              <label className="clean-label">Password</label>
              <div className="clean-input-box">
                <svg className="clean-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="library_account_token"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  className="clean-text-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="clean-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-pass-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button type="button" className="btn-login-submit" onClick={handleSubmit}>
              Login
            </button>

            <p className="login-footer-hint">
              New here? Contact your administrator to register your student ID.
            </p>
          </div>
        </div>

        {/* Right Graphic Banner */}
        <div className="login-banner-panel">
          <div className="banner-ambient-overlay"></div>
          <div className="login-banner-content">
            <h4 className="banner-quote-title">Books Build Brighter Futures</h4>
            <p className="banner-quote-sub">Manage &bull; Explore &bull; Learn</p>
          </div>
        </div>

        {/* Close Button */}
        <button className="login-close-x" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}
