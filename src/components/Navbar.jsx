import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const firstName = displayName.split(' ')[0]
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isDashboardActive = location.pathname === '/dashboard'

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={closeMenu}>
        <span className="logo-icon">
          <i className="fas fa-calendar-check"></i>
        </span>
        <span className="logo-text">Appoint<span>ly</span></span>
      </Link>

      {/* Hamburger button for mobile */}
      <button
        className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Navigation links */}
      <nav className={`navbar ${mobileMenuOpen ? 'active' : ''}`}>
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' && !location.hash ? 'active' : ''}`}
          onClick={closeMenu}
        >
          <i className="fas fa-home nav-icon"></i> Home
        </Link>
        <a
          href="/#services"
          className="nav-link"
          onClick={closeMenu}
        >
          <i className="fas fa-concierge-bell nav-icon"></i> Services
        </a>
        <a
          href="/#about"
          className="nav-link"
          onClick={closeMenu}
        >
          <i className="fas fa-info-circle nav-icon"></i> About
        </a>
        <Link
          to="/booking"
          className={`nav-link ${location.pathname === '/booking' ? 'active' : ''}`}
          onClick={closeMenu}
        >
          <i className="fas fa-clock nav-icon"></i> Book Now
        </Link>
        <a
          href="/#testimonials"
          className="nav-link"
          onClick={closeMenu}
        >
          <i className="fas fa-star nav-icon"></i> Reviews
        </a>
        <a
          href="/#contact"
          className="nav-link"
          onClick={closeMenu}
        >
          <i className="fas fa-envelope nav-icon"></i> Contact
        </a>

        {/* Mobile auth buttons inside menu */}
        <div className="mobile-auth-section">
          {user ? (
            <div className="mobile-user-actions">
              <Link to="/dashboard" className="btn btn-outline" onClick={closeMenu}>
                <i className="fas fa-columns"></i> My Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-danger">
                <i className="fas fa-sign-out-alt"></i> Logout ({firstName})
              </button>
            </div>
          ) : (
            <div className="mobile-guest-actions">
              <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Auth Section */}
      <div className="header-buttons desktop-only">
        {user ? (
          <div className="user-nav-dropdown">
            <Link
              to="/dashboard"
              className={`user-profile-chip ${isDashboardActive ? 'active-chip' : ''}`}
              title="Open Dashboard"
            >
              <span className="avatar-circle">{initials}</span>
              <span className="user-name">{firstName}</span>
              <span className="chip-badge">Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn logout-btn"
              title="Sign Out"
              aria-label="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn login-btn">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
            <Link to="/register" className="btn signup-btn">
              <i className="fas fa-user-plus"></i> Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
