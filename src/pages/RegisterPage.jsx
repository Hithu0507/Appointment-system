import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Auth.css'

function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successNotice, setSuccessNotice] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
      })

      // If Supabase has email confirmation enabled
      if (result.user && !result.session) {
        setSuccessNotice(true)
      } else {
        // Direct session created
        navigate(redirectPath)
      }
    } catch (err) {
      console.error('Registration error:', err)
      if (err.message?.toLowerCase().includes('rate limit')) {
        setErrorMsg('Supabase Email Rate Limit Exceeded: Supabase free tier restricts sending more than 3 confirmation emails per hour. To fix this instantly: Go to Supabase Dashboard > Authentication > Providers > Email and turn OFF "Confirm email".')
      } else {
        setErrorMsg(err.message || 'Failed to create account. Please try again.')
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
              <i className="fas fa-user-plus"></i>
            </span>
            <h2>Create Your Account</h2>
            <p>Join Appointly for fast, verified appointment bookings.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <i className="fas fa-exclamation-circle"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice ? (
            <div className="auth-success-card">
              <div className="auth-success-icon">
                <i className="fas fa-envelope-circle-check"></i>
              </div>
              <h3>Account Created!</h3>
              <p>
                A verification link has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder) to confirm your account and log in.
              </p>
              <div className="dev-tip-box">
                <i className="fas fa-lightbulb"></i>
                <span>Tip: In Supabase dashboard under Authentication &gt; Providers &gt; Email, you can disable "Confirm email" for instant login during testing.</span>
              </div>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                Go to Login Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emily Watson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>

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
                <label>Phone Number (Optional)</label>
                <div className="input-with-icon">
                  <i className="fas fa-phone input-icon"></i>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-with-icon">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="show-pw-link"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>{' '}
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
              </button>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-check"></i> Register & Create Account
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer-prompt">
            Already have an account?{' '}
            <Link to={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}>
              Sign in here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RegisterPage
