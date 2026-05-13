import React, { useState } from 'react';
import api from '../utils/api';
import { whatsappCustom } from '../utils/whatsapp';
import toast from 'react-hot-toast';
import './CustomPage.css';

const TYPES = ['Chain / Necklace', 'Pendant', 'Ring', 'Bracelet', 'Earrings', 'Grillz', 'Other'];

export default function CustomPage() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', jewelleryType:'', vision:'', budget:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/custom', form);
      setSubmitted(true);
      toast.success('Request submitted! We\'ll contact you within 48 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!form.jewelleryType || !form.vision) {
      toast.error('Please fill in the jewellery type and vision first');
      return;
    }
    whatsappCustom(form);
  };

  if (submitted) return (
    <div className="custom-success">
      <div className="success-icon">💎</div>
      <h2>Request Received!</h2>
      <p>Thank you for reaching out. Our team will contact you within <strong>48 hours</strong> with a quote for your custom piece.</p>
      <button className="btn-primary" onClick={() => setSubmitted(false)} style={{marginTop:'1.5rem'}}>Submit Another Request</button>
    </div>
  );

  return (
    <div className="custom-page">
      <div className="custom-hero">
        <div className="section-label" style={{justifyContent:'center'}}>Bespoke Service</div>
        <h1 className="section-title" style={{textAlign:'center'}}>Make It Yours</h1>
        <p className="custom-hero-sub">Turn your vision into reality. Fill out the form below and our team will send you a quote within 48 hours.</p>
        <div className="custom-stats">
          {[['48hr','Quote Turnaround'],['100%','Custom Designed'],['Since 2018','Expert Craftsmen']].map(([n,l]) => (
            <div key={l} className="custom-stat">
              <div className="custom-stat-num">{n}</div>
              <div className="custom-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-form-wrap container">
        <form className="custom-form" onSubmit={handleSubmit}>
          <h3 className="form-section-title">Your Details</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Rahul" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Sharma" required/>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone / WhatsApp *</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required/>
            </div>
          </div>

          <div className="form-divider"/>
          <h3 className="form-section-title">Your Piece</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Jewellery Type *</label>
              <select className="form-select" name="jewelleryType" value={form.jewelleryType} onChange={handleChange} required>
                <option value="">Select type...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget (approximate)</label>
              <input className="form-input" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. ₹5,000 – ₹15,000"/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Describe Your Vision *</label>
            <textarea
              className="form-textarea" name="vision" value={form.vision} onChange={handleChange} required
              placeholder="Describe your custom piece in detail — design, size, stones, metal, inspiration, occasion, etc. The more detail you provide, the better we can help you."
              style={{ minHeight: 140 }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'0.5rem'}} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Custom Quote Request →'}
          </button>
          <button type="button" className="wa-custom-btn" onClick={handleWhatsApp}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Or Send via WhatsApp Instead
          </button>
        </form>

        <aside className="custom-aside">
          <div className="aside-block">
            <h3 className="aside-title">How It Works</h3>
            {[
              { step:'01', title:'Submit Request', desc:'Fill out the form with your vision and details.' },
              { step:'02', title:'We Quote You', desc:'Our team reviews and sends you a price quote within 48 hours.' },
              { step:'03', title:'Confirm & Pay', desc:'Approve the quote and pay a deposit to begin crafting.' },
              { step:'04', title:'Receive Your Piece', desc:'Your custom jewellery is crafted and shipped to you.' },
            ].map(s => (
              <div key={s.step} className="how-step">
                <span className="step-num">{s.step}</span>
                <div>
                  <p className="step-title">{s.title}</p>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="aside-block">
            <h3 className="aside-title">Visit Us</h3>
            <p className="aside-address">
              Aagam Viviana<br/>
              Vesu Main road<br/>
              Surat, Gujarat, 395007
            </p>
            <a href="https://www.instagram.com/wywindia/" target="_blank" rel="noreferrer" className="btn-ghost" style={{marginTop:'1rem',display:'inline-flex'}}>
              @wywindia on Instagram
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
