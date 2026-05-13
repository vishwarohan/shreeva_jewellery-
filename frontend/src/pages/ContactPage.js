import React, { useState } from 'react';
import { whatsappGeneral, whatsappLink } from '../utils/whatsapp';
import toast from 'react-hot-toast';
import './ContactPage.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.message) { toast.error('Please fill in name and message'); return; }
    // In production, wire this to an email API / nodemailer endpoint
    toast.success('Message sent! We\'ll get back to you soon.');
    setSent(true);
  };

  const handleWhatsApp = () => {
    if (!form.name || !form.message) { toast.error('Please fill in name and message first'); return; }
    whatsappGeneral(form.name, `${form.subject ? `[${form.subject}] ` : ''}${form.message}`);
  };

  return (
    <div className="contact-page" style={{ paddingTop: '68px' }}>

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="section-label" style={{ justifyContent: 'center' }}>Get In Touch</div>
          <h1 className="section-title" style={{ textAlign: 'center' }}>Contact Us</h1>
          <p className="contact-hero-sub">
            Have a question? Want a custom piece? We're just a message away —<br/>
            reach us on WhatsApp for the fastest response.
          </p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="wa-hero-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="contact-cards container">
        {[
          {
            icon: '📍', title: 'Visit Our Store',
            lines: ['Aagam Viviana', 'Vesu Main road', 'Surat, Gujarat, 395007'],
            action: { label: 'Get Directions', href: 'https://maps.google.com/?q=Aagam+Viviana+Vesu+Main+road+Surat+Gujarat+395007' },
          },
          {
            icon: '💬', title: 'WhatsApp',
            lines: ['9279921642', 'Mon–Sat: 10am – 8pm IST', 'Fastest response channel'],
            action: { label: 'Open WhatsApp', href: whatsappLink() },
          },
          {
            icon: '📸', title: 'Instagram',
            lines: ['@wywindia', 'DM us for custom enquiries', 'See our latest drops'],
            action: { label: 'Follow Us', href: 'https://www.instagram.com/wywindia/' },
          },
          {
            icon: '✉️', title: 'Email',
            lines: ['info@shreevajewels.com', 'Custom design enquiries', 'Business collaborations'],
            action: { label: 'Send Email', href: 'mailto:info@shreevajewels.com' },
          },
        ].map(card => (
          <div key={card.title} className="contact-card">
            <span className="contact-card-icon">{card.icon}</span>
            <h3 className="contact-card-title">{card.title}</h3>
            {card.lines.map(l => <p key={l} className="contact-card-line">{l}</p>)}
            <a href={card.action.href} target="_blank" rel="noreferrer" className="contact-card-action">{card.action.label} →</a>
          </div>
        ))}
      </section>

      {/* FORM + MAP */}
      <section className="contact-main container">

        {/* FORM */}
        <div className="contact-form-wrap">
          <div className="section-label">Send a Message</div>
          <h2 className="section-title" style={{ marginBottom: '1.75rem' }}>Drop Us a Line</h2>

          {sent ? (
            <div className="contact-sent">
              <span className="sent-icon">✅</span>
              <h3>Message Received!</h3>
              <p>We'll get back to you within 24–48 hours. For faster response, chat with us on WhatsApp.</p>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="wa-hero-btn" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Open WhatsApp
              </a>
              <button className="btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => { setSent(false); setForm({ name:'',email:'',phone:'',subject:'',message:'' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com"/>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">Select subject...</option>
                    <option>Product Enquiry</option>
                    <option>Custom Order</option>
                    <option>Order Status</option>
                    <option>Returns & Refunds</option>
                    <option>Wholesale / Bulk</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-textarea" name="message" value={form.message} onChange={handleChange}
                  placeholder="Tell us how we can help you..." style={{ minHeight: 130 }} required/>
              </div>

              <div className="contact-submit-row">
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Send Message →
                </button>
                <button type="button" className="wa-form-btn" onClick={handleWhatsApp}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
              </div>
              <p className="form-note">Or skip the form — <a href={whatsappLink()} target="_blank" rel="noreferrer">message us directly on WhatsApp</a> for a faster reply.</p>
            </form>
          )}
        </div>

        {/* STORE INFO + HOURS */}
        <div className="contact-aside">
          <div className="store-card">
            <h3 className="store-card-title">🏪 Our Surat Store</h3>
            <div className="store-map-embed">
              <iframe
                title="WYW Surat Store"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.6!2d72.836!3d19.117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA3JzAxLjIiTiA3MsKwNTAnMDkuNiJF!5e0!3m2!1sen!2sin!4v1"
                width="100%" height="220" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
            <div className="store-details">
              <p>Aagam Viviana<br/>Vesu Main road<br/>Surat, Gujarat, 395007</p>
              <a href="https://maps.google.com/?q=Aagam+Viviana+Vesu+Main+road+Surat+Gujarat+395007" target="_blank" rel="noreferrer" className="directions-link">
                📍 Get Directions →
              </a>
            </div>
          </div>

          <div className="hours-card">
            <h3 className="hours-title">🕐 Store Hours</h3>
            <div className="hours-list">
              {[
                { day: 'Monday – Friday', time: '10:00 AM – 9:00 PM' },
                { day: 'Saturday', time: '10:00 AM – 10:00 PM' },
                { day: 'Sunday', time: '11:00 AM – 8:00 PM' },
              ].map(h => (
                <div key={h.day} className="hours-row">
                  <span className="hours-day">{h.day}</span>
                  <span className="hours-time">{h.time}</span>
                </div>
              ))}
            </div>
            <p className="hours-note">WhatsApp orders accepted 24/7</p>
          </div>

          {/* FLOATING WHATSAPP CTA */}
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="wa-aside-cta">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <div>
              <strong>Chat with us on WhatsApp</strong>
              <span>Fastest way to reach us</span>
            </div>
          </a>
        </div>
      </section>

      {/* FLOATING WhatsApp BUBBLE */}
      <a href={whatsappLink()} target="_blank" rel="noreferrer" className="wa-bubble" title="Chat on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}
