import React, { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 800)
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        
        <div className="contact-header">
          <span className="badge-pill">
            <i className="fas fa-headset"></i> GET IN TOUCH
          </span>
          <h2>We're Here to Help</h2>
          <p>
            Have questions about our services or need assistance with your booking? Reach out to our dedicated support team anytime.
          </p>
        </div>

        <div className="contact-grid">
          {/* Info cards */}
          <div className="contact-info-column">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="info-body">
                <h4>Visit Our Clinic</h4>
                <p>124 Health Avenue, Suite 400<br />Medical Plaza, NY 10001</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="info-body">
                <h4>Call Us Directly</h4>
                <p>+1 (800) 456-7890<br />+1 (555) 234-5678</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <div className="info-body">
                <h4>Email Support</h4>
                <p>support@appointly.com<br />contact@appointly.com</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-business-time"></i>
              </div>
              <div className="info-body">
                <h4>Operating Hours</h4>
                <p>Mon – Fri: 09:00 AM – 05:00 PM<br />Saturday: 10:00 AM – 02:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-column">
            <div className="form-card">
              <h3>Send Us a Message</h3>
              <p className="form-subtitle">Fill in the form below and we will respond within 24 hours.</p>

              {submitted && (
                <div className="alert-success">
                  <i className="fas fa-check-circle"></i>
                  <span>Thank you! Your message has been sent successfully. We will be in touch shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Inquiry regarding appointments"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default Contact
