import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">WYW</Link>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required/>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-switch" style={{marginTop:'0.5rem'}}>
          <Link to="/forgot-password" style={{color:'var(--muted)',borderBottom:'1px solid var(--muted)'}}>Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.phone);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">WYW</Link>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join the WYW family</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6}/>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
