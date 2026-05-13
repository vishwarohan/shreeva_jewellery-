import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPage.css';
import './ForgotPasswordPage.css';

// STEP 1 — Enter email
// STEP 2 — Enter OTP
// STEP 3 — Enter new password
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [devOtp, setDevOtp] = useState(''); // shown in dev mode
  const [passwords, setPasswords] = useState({ newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1 — request OTP
  const handleEmailSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      if (data.otp) {
        setDevOtp(data.otp); // dev mode — show OTP on screen
        toast(`🔧 Dev mode OTP: ${data.otp}`, { duration: 30000, icon: '💡' });
      }
      setStep(2);
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to send OTP'); }
    setLoading(false);
  };

  // Handle OTP input boxes
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx+1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx-1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    const newOtp = [...otp];
    pasted.split('').forEach((c,i) => { if (i < 6) newOtp[i] = c; });
    setOtp(newOtp);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // Step 2 — verify OTP
  const handleOtpSubmit = async e => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Please enter the full 6-digit OTP'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpStr });
      toast.success('OTP verified!');
      setStep(3);
    } catch(err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    setLoading(false);
  };

  // Step 3 — reset password
  const handleResetSubmit = async e => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const otpStr = otp.join('');
      const { data } = await api.post('/auth/reset-password', { email, otp: otpStr, newPassword: passwords.newPassword });
      toast.success('Password reset successfully! Logging you in...');
      // Auto login
      if (data.token) {
        localStorage.setItem('wyw_token', data.token);
        localStorage.setItem('wyw_user', JSON.stringify(data.user));
        setTimeout(() => navigate('/account'), 1200);
      } else {
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to reset password'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card forgot-card">
        <Link to="/" className="auth-logo">WYW</Link>

        {/* STEP INDICATOR */}
        <div className="step-indicator">
          {['Email','OTP','New Password'].map((s,i) => (
            <div key={s} className={`step-dot-wrap ${step > i+1 ? 'done' : step === i+1 ? 'current' : ''}`}>
              <div className="step-dot">{step > i+1 ? '✓' : i+1}</div>
              <span className="step-dot-label">{s}</span>
              {i < 2 && <div className={`step-line ${step > i+1 ? 'done' : ''}`}/>}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-sub">Enter your registered email and we'll send you an OTP.</p>
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required autoFocus/>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </form>
            <p className="auth-switch">Remember your password? <Link to="/login">Sign in</Link></p>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <h2 className="auth-title">Enter OTP</h2>
            <p className="auth-sub">We sent a 6-digit OTP to <strong style={{color:'var(--gold)'}}>{email}</strong></p>

            {devOtp && (
              <div className="dev-otp-banner">
                🔧 Dev Mode — Your OTP: <strong>{devOtp}</strong>
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div className="otp-boxes">
                {otp.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`}
                    className="otp-input"
                    type="text" inputMode="numeric"
                    maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              <p className="otp-timer">OTP expires in 15 minutes</p>
              <button type="submit" className="btn-primary auth-btn" disabled={loading || otp.join('').length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>
            </form>
            <button className="resend-btn" onClick={() => { setStep(1); setOtp(['','','','','','']); }}>
              ← Change email / Resend OTP
            </button>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <h2 className="auth-title">New Password</h2>
            <p className="auth-sub">Create a strong new password for your account.</p>
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{position:'relative',display:'flex'}}>
                  <input className="form-input" type={showPw ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters" required style={{paddingRight:'2.5rem'}} autoFocus/>
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{position:'absolute',right:'0.6rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {passwords.newPassword && (
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.4rem'}}>
                    {[1,2,3,4].map(n => {
                      const str = pwStrength(passwords.newPassword);
                      const colors = ['','#e74c3c','#f39c12','#3498db','#2ecc71'];
                      return <div key={n} style={{height:4,width:36,borderRadius:2,background: str>=n ? colors[str] : 'var(--dark-elevated)',transition:'background 0.3s'}}/>;
                    })}
                    <span style={{fontSize:'0.72rem',color:'var(--muted)'}}>
                      {['','Weak','Fair','Good','Strong'][pwStrength(passwords.newPassword)]}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat your password" required/>
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p style={{fontSize:'0.78rem',color:'#e74c3c',marginTop:'0.25rem'}}>⚠️ Passwords do not match</p>
                )}
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading || passwords.newPassword !== passwords.confirmPassword}>
                {loading ? 'Resetting...' : 'Reset Password ✓'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
