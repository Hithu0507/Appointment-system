import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserAppointments, cancelAppointment, formatTimeRange } from '../lib/bookingApi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './DashboardPage.css'

function DashboardPage() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'upcoming', 'confirmed', 'cancelled', 'profile'
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [apptToCancel, setApptToCancel] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  // Profile edit form state
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/dashboard')
    }
  }, [user, authLoading, navigate])

  // Sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '')
      setProfilePhone(profile.phone || '')
    }
  }, [profile])

  // Fetch user appointments from Supabase
  const loadAppointments = async () => {
    if (!user) return
    setLoadingAppts(true)
    try {
      const data = await getUserAppointments(user.id)
      setAppointments(data)
    } catch (err) {
      console.error('Failed to load appointments:', err)
      setActionMessage({ type: 'error', text: 'Failed to fetch appointments from database.' })
    } finally {
      setLoadingAppts(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  // Handle cancellation confirmation
  const handleConfirmCancel = async () => {
    if (!apptToCancel || !user) return
    setCancellingId(apptToCancel.id)
    try {
      await cancelAppointment(apptToCancel.id, user.id)
      setActionMessage({
        type: 'success',
        text: `Appointment #${apptToCancel.id} has been cancelled successfully.`,
      })
      setShowCancelModal(false)
      setApptToCancel(null)
      // Refresh list
      await loadAppointments()
    } catch (err) {
      console.error('Cancel failed:', err)
      setActionMessage({ type: 'error', text: err.message || 'Could not cancel appointment.' })
    } finally {
      setCancellingId(null)
    }
  }

  // Handle profile save
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile({
        full_name: profileName.trim(),
        phone: profilePhone.trim(),
      })
      setActionMessage({ type: 'success', text: 'Profile information updated successfully!' })
    } catch (err) {
      console.error('Failed to save profile:', err)
      setActionMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSavingProfile(false)
    }
  }

  // Calculate statistics
  const todayStr = new Date().toISOString().split('T')[0]

  const totalCount = appointments.length
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length
  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length
  const upcomingCount = appointments.filter(
    (a) => a.status !== 'cancelled' && a.appointment_date >= todayStr
  ).length

  // Filter appointments for the active tab
  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'all') return true
    if (activeTab === 'upcoming') return a.status !== 'cancelled' && a.appointment_date >= todayStr
    if (activeTab === 'confirmed') return a.status === 'confirmed'
    if (activeTab === 'cancelled') return a.status === 'cancelled'
    return true
  })

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="dashboard-page loading-screen">
        <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        {/* Top Welcome Banner */}
        <div className="dashboard-welcome-card">
          <div className="welcome-left">
            <div className="welcome-avatar-circle">{initials}</div>
            <div className="welcome-text">
              <h1>Welcome back, <span>{displayName}</span>!</h1>
              <p>
                <i className="fas fa-envelope"></i> {user.email} &nbsp;·&nbsp;
                <i className="fas fa-phone"></i> {profile?.phone || 'No phone set'} &nbsp;·&nbsp;
                <i className="fas fa-shield-alt"></i> Patient Account
              </p>
            </div>
          </div>

          <div className="welcome-actions">
            <Link to="/booking" className="btn btn-primary">
              <i className="fas fa-plus-circle"></i> Book New Appointment
            </Link>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className={`dash-alert ${actionMessage.type === 'success' ? 'dash-alert-success' : 'dash-alert-error'}`}>
            <i className={`fas ${actionMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{actionMessage.text}</span>
            <button className="alert-close" onClick={() => setActionMessage(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* 5 Stat Cards */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card stat-total">
            <div className="d-stat-icon"><i className="fas fa-calendar-alt"></i></div>
            <div className="d-stat-info">
              <h3>{totalCount}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div className="dash-stat-card stat-upcoming">
            <div className="d-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="d-stat-info">
              <h3>{upcomingCount}</h3>
              <p>Upcoming</p>
            </div>
          </div>

          <div className="dash-stat-card stat-confirmed">
            <div className="d-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="d-stat-info">
              <h3>{confirmedCount}</h3>
              <p>Confirmed</p>
            </div>
          </div>

          <div className="dash-stat-card stat-pending">
            <div className="d-stat-icon"><i className="fas fa-hourglass-half"></i></div>
            <div className="d-stat-info">
              <h3>{pendingCount}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="dash-stat-card stat-cancelled">
            <div className="d-stat-icon"><i className="fas fa-ban"></i></div>
            <div className="d-stat-info">
              <h3>{cancelledCount}</h3>
              <p>Cancelled</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="dash-tabs-bar">
          <div className="tabs-list">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-list"></i> All Appointments ({totalCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <i className="fas fa-clock"></i> Upcoming ({upcomingCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
              onClick={() => setActiveTab('confirmed')}
            >
              <i className="fas fa-check"></i> Confirmed ({confirmedCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              <i className="fas fa-times-circle"></i> Cancelled ({cancelledCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user-cog"></i> Profile Settings
            </button>
          </div>
        </div>

        {/* Content Section: Appointments vs Profile */}
        {activeTab !== 'profile' ? (
          <div className="dash-appointments-section">
            {loadingAppts ? (
              <div className="dash-loading-card">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Retrieving your appointment records from Supabase...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="dash-empty-state">
                <i className="fas fa-calendar-times"></i>
                <h3>No Appointments Found</h3>
                <p>You don't have any appointments matching this category.</p>
                <Link to="/booking" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  <i className="fas fa-calendar-plus"></i> Book an Appointment
                </Link>
              </div>
            ) : (
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Service Details</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appt) => {
                      const serviceName = appt.services?.name || 'Medical Consultation'
                      const serviceDuration = appt.services?.duration_minutes || 60
                      const servicePrice = appt.services?.price ? `$${Number(appt.services.price).toFixed(2)}` : ''
                      const isCancelled = appt.status === 'cancelled'
                      const isPast = appt.appointment_date < todayStr

                      return (
                        <tr key={appt.id} className={isCancelled ? 'row-cancelled' : ''}>
                          <td>
                            <span className="appt-id-badge">#{appt.id}</span>
                          </td>
                          <td>
                            <div className="table-service-info">
                              <strong>{serviceName}</strong>
                              <span className="sub-detail">
                                {serviceDuration} min {servicePrice ? `· ${servicePrice}` : ''}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="table-date-badge">
                              <i className="far fa-calendar-alt"></i>
                              <span>{appt.appointment_date}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-time-badge">
                              <i className="far fa-clock"></i>
                              <span>{appt.appointment_time}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill status-${appt.status}`}>
                              {appt.status === 'confirmed' && <i className="fas fa-check-circle"></i>}
                              {appt.status === 'pending' && <i className="fas fa-hourglass-start"></i>}
                              {appt.status === 'cancelled' && <i className="fas fa-ban"></i>}
                              <span>{appt.status.toUpperCase()}</span>
                            </span>
                          </td>
                          <td>
                            <div className="table-notes" title={appt.notes}>
                              {appt.notes ? appt.notes : <span className="no-notes">—</span>}
                            </div>
                          </td>
                          <td className="text-right">
                            {!isCancelled ? (
                              <button
                                className="btn-cancel-appt"
                                onClick={() => {
                                  setApptToCancel(appt)
                                  setShowCancelModal(true)
                                }}
                                title="Cancel this appointment"
                              >
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            ) : (
                              <span className="cancelled-label">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Profile Settings Tab */
          <div className="dash-profile-section">
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>
                  <i className="fas fa-user-edit"></i> Edit Profile Information
                </h3>
                <p>Update your personal information stored in Supabase profiles table.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Account Email (Read-only)</label>
                    <input type="email" value={user.email} disabled className="disabled-input" />
                    <span className="input-hint">Your email is managed by Supabase Authentication.</span>
                  </div>

                  <div className="form-group">
                    <label>User ID (Supabase Auth UID)</label>
                    <input type="text" value={user.id} disabled className="disabled-input code-font" />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 000-0000"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving Profile...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && apptToCancel && (
        <div className="cancel-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>

            <h3>Cancel Appointment #{apptToCancel.id}?</h3>
            <p className="cancel-modal-desc">
              Are you sure you want to cancel your appointment for{' '}
              <strong>{apptToCancel.services?.name || 'Service'}</strong> on{' '}
              <strong>{apptToCancel.appointment_date}</strong> at{' '}
              <strong>{apptToCancel.appointment_time}</strong>?
            </p>
            <p className="cancel-warning-sub">
              This will update the appointment status to <strong>cancelled</strong> in Supabase and release your reserved time slot.
            </p>

            <div className="cancel-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
                disabled={cancellingId === apptToCancel.id}
              >
                No, Keep It
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={cancellingId === apptToCancel.id}
              >
                {cancellingId === apptToCancel.id ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Cancelling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Yes, Cancel Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default DashboardPage
