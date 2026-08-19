import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import { useAuth } from './AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/auth/login', { username, password });
      if (res.data.status) {
        const { token, username: userEmail, fullName, role } = res.data.data;
        login(token, { username: userEmail, fullName, role });
        navigate('/');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-centered-container">
      <div className="login-right-panel">
        <div className="login-square-card">
          <div className="login-logo-circle">
            <i className="ti ti-school"></i>
          </div>
          <div className="login-brand-subtitle">Academy & Library Management</div>
          <h2>Welcome Back</h2>
          <p className="login-subtext">Sign in to access the admin dashboard.</p>

          {error && (
            <div className="badge badge-red" style={{ width: '100%', padding: '8px 12px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field" style={{ marginBottom: '16px' }}>
              <label>Email Address</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                />
                <i className="ti ti-mail input-icon-right"></i>
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember Me
              </label>
              <span className="secure-access-label">Secure Access</span>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer-copy">Copyright 2026 © Academy & Library Management</p>
        </div>
      </div>
    </div>
  );
};