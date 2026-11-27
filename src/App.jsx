import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Services from './components/Services'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BookingPage from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

// HOME LANDING COMPONENT
function HomePage() {
  return (
    <div className="home-wrapper">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            <i className="fas fa-sparkles"></i> SMART APPOINTMENT BOOKING
          </span>

          <h1>
            Book Your Time,
            <br />
            <span>Make It Easy.</span>
          </h1>

          <p>
            Schedule your appointments easily and quickly with verified specialists.
            Choose your preferred service, select a convenient date and time slot,
            and secure your booking in just a few clicks.
          </p>

          <div className="hero-cta-group">
            <Link to="/booking" className="hero-btn">
              Book Appointment <i className="fas fa-arrow-right"></i>
            </Link>
            <a href="#services" className="hero-btn-secondary">
              View Services & Pricing <i className="fas fa-chevron-down"></i>
            </a>
          </div>

          <div className="hero-trust-metrics">
            <div className="metric-pill">
              <i className="fas fa-check-circle text-primary"></i>
              <span>Real-Time Slot Availability</span>
            </div>
            <div className="metric-pill">
              <i className="fas fa-shield-alt text-primary"></i>
              <span>Supabase RLS Protected</span>
            </div>
            <div className="metric-pill">
              <i className="fas fa-history text-primary"></i>
              <span>Free Instant Cancellation</span>
            </div>
          </div>
        </div>

        {/* HERO QUICK BOOKING PREVIEW CARD */}
        <div className="hero-image">
          <div className="booking-card">
            <div className="card-badge">
              <i className="fas fa-bolt"></i> Instant Booking
            </div>

            <h3>Quick Booking</h3>
            <p className="card-description">
              Your appointment at your convenience
            </p>

            <Link to="/booking" className="booking-item">
              <div className="booking-icon">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="booking-item-text">
                <h4>1. Choose Service</h4>
                <p>Select your preferred consultation or checkup</p>
              </div>
              <i className="fas fa-chevron-right item-arrow"></i>
            </Link>

            <Link to="/booking" className="booking-item">
              <div className="booking-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="booking-item-text">
                <h4>2. Select Date</h4>
                <p>Choose your convenient date from calendar</p>
              </div>
              <i className="fas fa-chevron-right item-arrow"></i>
            </Link>

            <Link to="/booking" className="booking-item">
              <div className="booking-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="booking-item-text">
                <h4>3. Choose Time Slot</h4>
                <p>Pick your available reserved slot</p>
              </div>
              <i className="fas fa-chevron-right item-arrow"></i>
            </Link>

            <Link to="/booking" className="card-bottom">
              <i className="fas fa-check-circle"></i> Start Booking Now
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <Services />

      {/* ABOUT US SECTION */}
      <About />

      {/* TESTIMONIALS SECTION */}
      <Testimonials />

      {/* CONTACT SECTION */}
      <Contact />

      {/* FOOTER */}
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="not-found-page">
      <Navbar />
      <div className="not-found-content">
        <i className="fas fa-compass fa-3x text-primary"></i>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home"></i> Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
