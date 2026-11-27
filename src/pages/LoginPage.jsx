import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Auth.css'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await signIn(email.trim(), password)
      navigate(redirectPath)
    } catch (err) {
      console.error('Login error:', err)
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please verify and try again.')
      } else if (err.message?.includes('Email not confirmed')) {
        setErrorMsg('Please confirm your email address via the verification link sent to your inbox, or toggle "Confirm email" OFF in Supabase settings.')
      } else {
        setErrorMsg(err.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-icon-badge">
              <i className="fas fa-lock"></i>
            </span>
            <h2>Welcome Back</h2>
            <p>Log in to access your appointments and personal dashboard.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <i className="fas fa-exclamation-circle"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label>Password</label>
              </div>
              <div className="input-with-icon">
                <i className="fas fa-key input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign In to Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Don't have an account yet?{' '}
            <Link to={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}>
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LoginPage
