import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">
                <i className="fas fa-calendar-check"></i>
              </span>
              <span className="logo-text">Appoint<span>ly</span></span>
            </Link>
            <p className="brand-desc">
              Next-generation appointment scheduling platform powered by Supabase. Fast, intuitive, and synchronized in real-time.
            </p>
            <div className="social-links">
              <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="/#services">Services & Pricing</a></li>
              <li><a href="/#about">About Us</a></li>
              <li><Link to="/booking">Book Appointment</Link></li>
              <li><a href="/#testimonials">Patient Reviews</a></li>
              <li><a href="/#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4>Top Services</h4>
            <ul>
              <li><Link to="/booking">General Consultation</Link></li>
              <li><Link to="/booking">Dental Care & Hygiene</Link></li>
              <li><Link to="/booking">Full Health Diagnostic</Link></li>
              <li><Link to="/booking">Dermatology Sessions</Link></li>
              <li><Link to="/booking">Cardiology Screening</Link></li>
              <li><Link to="/booking">Mental Wellness Therapy</Link></li>
            </ul>
          </div>

          {/* Hours & Newsletter */}
          <div className="footer-col">
            <h4>Working Hours</h4>
            <p className="hours-text"><i className="far fa-clock"></i> Mon – Fri: 09:00 AM – 05:00 PM</p>
            <p className="hours-text"><i className="far fa-clock"></i> Saturday: 10:00 AM – 02:00 PM</p>
            <p className="hours-text"><i className="far fa-times-circle"></i> Sunday: Closed</p>

            <h4 style={{ marginTop: '20px' }}>Newsletter</h4>
            <div className="newsletter-box">
              <input type="email" placeholder="Your email address" />
              <button type="button" aria-label="Subscribe">
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container bottom-container">
          <p>© {new Date().getFullYear()} Appointly. All rights reserved. Built with React & Supabase.</p>
          <div className="bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
