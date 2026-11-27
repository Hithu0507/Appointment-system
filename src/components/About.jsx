import React from 'react'
import { Link } from 'react-router-dom'
import './About.css'

function About() {
  const stats = [
    { number: '15,000+', label: 'Appointments Booked', icon: 'fa-calendar-check' },
    { number: '99.4%', label: 'Customer Satisfaction', icon: 'fa-smile-beam' },
    { number: '50+', label: 'Verified Specialists', icon: 'fa-user-md' },
    { number: '24 / 7', label: 'Online Booking Access', icon: 'fa-clock' },
  ]

  const features = [
    {
      icon: 'fa-bolt',
      title: 'Instant Confirmation',
      description: 'Get immediate confirmation directly synced with our database, preventing double-booking.',
    },
    {
      icon: 'fa-calendar-alt',
      title: 'Flexible Scheduling',
      description: 'Easily select your preferred date, pick available time slots, or cancel with one click from your dashboard.',
    },
    {
      icon: 'fa-shield-alt',
      title: 'Verified & Secure',
      description: 'Full data privacy protected with Supabase Row Level Security (RLS) and enterprise encryption.',
    },
    {
      icon: 'fa-heart',
      title: 'Expert Care & Support',
      description: 'Connect with certified healthcare and wellness professionals dedicated to your personal health.',
    },
  ]

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        
        {/* Top Header */}
        <div className="about-header">
          <span className="badge-pill">
            <i className="fas fa-heartbeat"></i> ABOUT APPOINTLY
          </span>
          <h2>Your Trusted Partner in Seamless Health & Wellness Care</h2>
          <p>
            We empower individuals to take control of their time and wellness. Our modern digital booking system connects you directly with leading specialists without phone waits, queues, or scheduling conflicts.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">
                <i className={`fas ${s.icon}`}></i>
              </div>
              <div className="stat-info">
                <h3>{s.number}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="about-split">
          <div className="about-image-column">
            <div className="about-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                alt="Medical Care Consultation"
                className="about-main-img"
              />
              <div className="experience-badge">
                <span className="badge-num">10+</span>
                <span className="badge-text">Years of Excellence in Care</span>
              </div>
            </div>
          </div>

          <div className="about-content-column">
            <h3>Why Thousands of Clients Choose Appointly</h3>
            <p className="about-lead">
              Our automated scheduling platform guarantees that every appointment is securely confirmed, accurately timed, and completely hassle-free.
            </p>

            <div className="features-list">
              {features.map((f, idx) => (
                <div key={idx} className="feature-item">
                  <div className="feature-icon">
                    <i className={`fas ${f.icon}`}></i>
                  </div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-cta">
              <Link to="/booking" className="btn btn-primary">
                Book Your First Visit <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default About
