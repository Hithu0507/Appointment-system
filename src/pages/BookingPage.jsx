import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getActiveServices,
  getTimeSlots,
  getBookedSlotsForDate,
  createAppointment,
  normalizeTime,
} from '../lib/bookingApi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './BookingPage.css'

function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  // Booking Flow State
  const [services, setServices] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // User selections
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [notes, setNotes] = useState('')

  // Flow control & feedback
  const [currentStep, setCurrentStep] = useState(1) // 1: Service, 2: Date & Time, 3: Notes & Summary, 4: Confirmed (Success)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Get today's date formatted as YYYY-MM-DD for min date
  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Initial Load: Services & Time Slots
  useEffect(() => {
    let mounted = true
    async function init() {
      setLoadingServices(true)
      try {
        const [servRes, slotsRes] = await Promise.all([
          getActiveServices(),
          getTimeSlots(),
        ])

        if (mounted) {
          setServices(servRes.data || [])
          setTimeSlots(slotsRes || [])

          // Check if pre-selected service in query param
          const queryServiceId = searchParams.get('service')
          if (queryServiceId) {
            const found = (servRes.data || []).find(
              (s) => String(s.id) === String(queryServiceId)
            )
            if (found) {
              setSelectedServiceId(found.id)
            }
          }
        }
      } catch (err) {
        console.error('Initialization error:', err)
      } finally {
        if (mounted) setLoadingServices(false)
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [searchParams])

  // 2. Fetch booked slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([])
      return
    }

    let mounted = true
    async function loadBooked() {
      setLoadingSlots(true)
      setErrorMessage('')
      try {
        const booked = await getBookedSlotsForDate(selectedDate)
        if (mounted) {
          setBookedSlots(booked)
          // If currently selected slot is booked, deselect it
          if (selectedTimeSlot && booked.includes(normalizeTime(selectedTimeSlot.start_time))) {
            setSelectedTimeSlot(null)
          }
        }
      } catch (err) {
        console.error('Failed to check availability:', err)
      } finally {
        if (mounted) setLoadingSlots(false)
      }
    }

    loadBooked()
    return () => {
      mounted = false
    }
  }, [selectedDate])

  const selectedService = services.find((s) => s.id === selectedServiceId)

  // Handler to proceed from Step 1 to Step 2
  const handleNextFromService = () => {
    if (!selectedServiceId) {
      setErrorMessage('Please select a service to proceed.')
      return
    }
    setErrorMessage('')
    setCurrentStep(2)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  // Handler to proceed from Step 2 to Step 3
  const handleNextFromDateTime = () => {
    if (!selectedDate) {
      setErrorMessage('Please choose your preferred appointment date.')
      return
    }
    if (!selectedTimeSlot) {
      setErrorMessage('Please pick an available time slot.')
      return
    }
    setErrorMessage('')
    setCurrentStep(3)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  // Handler for Final Confirmation (Step 8 & 9)
  const handleConfirmBooking = async () => {
    setErrorMessage('')

    if (!user) {
      setErrorMessage('You must be logged in to confirm your booking. Please sign in or register.')
      return
    }

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      setErrorMessage('Please ensure you have selected a service, date, and time slot.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createAppointment({
        userId: user.id,
        serviceId: selectedService.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot.start_time,
        notes: notes.trim(),
        status: 'confirmed',
      })

      setConfirmedBooking(result)
      setCurrentStep(4) // Step 10: Success Screen
      window.scrollTo({ top: 200, behavior: 'smooth' })
    } catch (err) {
      console.error('Booking failed:', err)
      setErrorMessage(err.message || 'Failed to save appointment. Please try again.')
      // Refresh booked slots in case collision occurred
      if (selectedDate) {
        const refreshedBooked = await getBookedSlotsForDate(selectedDate)
        setBookedSlots(refreshedBooked)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset booking form to book another
  const handleBookAnother = () => {
    setSelectedDate('')
    setSelectedTimeSlot(null)
    setNotes('')
    setConfirmedBooking(null)
    setErrorMessage('')
    setCurrentStep(1)
  }

  return (
    <div className="booking-page">
      <Navbar />

      <main className="booking-main-container">
        {/* Page Banner */}
        <div className="booking-page-header">
          <span className="badge-pill">
            <i className="fas fa-calendar-check"></i> ONLINE RESERVATION
          </span>
          <h1>Book an Appointment</h1>
          <p>
            Follow our quick 4-stage booking flow to schedule with verified specialists. Your booking is synchronized in real-time.
          </p>

          {/* Stepper Progress Bar */}
          <div className="booking-stepper">
            <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
              </div>
              <span className="step-label">Select Service</span>
            </div>

            <div className="step-line"></div>

            <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 2 ? <i className="fas fa-check"></i> : '2'}
              </div>
              <span className="step-label">Date & Time</span>
            </div>

            <div className="step-line"></div>

            <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 3 ? <i className="fas fa-check"></i> : '3'}
              </div>
              <span className="step-label">Review & Confirm</span>
            </div>

            <div className="step-line"></div>

            <div className={`step-item ${currentStep === 4 ? 'active completed' : ''}`}>
              <div className="step-circle">
                <i className="fas fa-flag-checkered"></i>
              </div>
              <span className="step-label">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="booking-error-banner">
            <i className="fas fa-exclamation-triangle"></i>
            <div>{errorMessage}</div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 1: STEP 1 - SERVICE SELECTION                          */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="booking-step-container">
            <div className="step-header">
              <h2>Step 1: Choose Your Preferred Service</h2>
              <p>Select the health or consultation service you need today.</p>
            </div>

            {loadingServices ? (
              <div className="step-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading available services...</p>
              </div>
            ) : (
              <div className="services-selection-grid">
                {services.map((s) => {
                  const isSelected = selectedServiceId === s.id
                  return (
                    <div
                      key={s.id}
                      className={`service-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedServiceId(s.id)}
                    >
                      <div className="select-radio-indicator">
                        <i className={isSelected ? 'fas fa-check-circle' : 'far fa-circle'}></i>
                      </div>

                      {s.image_url && (
                        <img src={s.image_url} alt={s.name} className="select-card-img" />
                      )}

                      <div className="select-card-info">
                        <div className="select-price-row">
                          <span className="select-price">${Number(s.price).toFixed(2)}</span>
                          <span className="select-duration">
                            <i className="far fa-clock"></i> {s.duration_minutes} min
                          </span>
                        </div>
                        <h3>{s.name}</h3>
                        <p>{s.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="step-action-bar">
              <div></div>
              <button
                className="btn btn-primary next-btn"
                onClick={handleNextFromService}
                disabled={!selectedServiceId}
              >
                Continue to Date & Time <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: STEPS 2, 3, 4, 5 - DATE & TIME SELECTION            */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="booking-step-container">
            <div className="step-header">
              <h2>Step 2 & 3: Select Date & Available Time Slot</h2>
              <p>
                Pick a date to check real-time availability. Reserved slots are disabled automatically.
              </p>
            </div>

            {/* Selected Service Bar Summary */}
            <div className="chosen-service-pill">
              <i className="fas fa-check-circle text-success"></i>
              <div>
                <strong>Selected Service:</strong> {selectedService?.name} (${Number(selectedService?.price).toFixed(2)} · {selectedService?.duration_minutes} min)
              </div>
              <button
                className="change-link"
                onClick={() => setCurrentStep(1)}
              >
                Change
              </button>
            </div>

            <div className="datetime-selection-grid">
              {/* Date Column */}
              <div className="date-picker-column">
                <label className="picker-label">
                  <i className="fas fa-calendar-alt"></i> Select Appointment Date
                </label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTimeSlot(null)
                    }}
                    className="date-picker-input"
                  />
                </div>
                <span className="date-hint">
                  <i className="fas fa-info-circle"></i> We accept reservations from today onwards.
                </span>

                {/* Quick Date Shortcuts */}
                <div className="quick-dates">
                  <span className="quick-title">Quick Select:</span>
                  <div className="quick-pills">
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => {
                        setSelectedDate(todayStr)
                        setSelectedTimeSlot(null)
                      }}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        setSelectedDate(tomorrow.toISOString().split('T')[0])
                        setSelectedTimeSlot(null)
                      }}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() => {
                        const inTwoDays = new Date()
                        inTwoDays.setDate(inTwoDays.getDate() + 2)
                        setSelectedDate(inTwoDays.toISOString().split('T')[0])
                        setSelectedTimeSlot(null)
                      }}
                    >
                      In 2 Days
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots Column */}
              <div className="time-slots-column">
                <label className="picker-label">
                  <i className="fas fa-clock"></i> Available Time Slots
                  {selectedDate && (
                    <span className="slots-date-badge">for {selectedDate}</span>
                  )}
                </label>

                {!selectedDate ? (
                  <div className="slots-empty-state">
                    <i className="far fa-calendar"></i>
                    <p>Please pick a date on the left to view available time slots.</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="slots-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Checking slot availability...</p>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {timeSlots.map((slot) => {
                      const normalizedStart = normalizeTime(slot.start_time)
                      const isBooked = bookedSlots.includes(normalizedStart)
                      const isSelected = selectedTimeSlot?.start_time === slot.start_time

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`time-slot-btn ${isSelected ? 'selected' : ''} ${
                            isBooked ? 'booked' : 'available'
                          }`}
                        >
                          <span className="slot-time">{slot.label}</span>
                          <span className="slot-badge">
                            {isBooked ? (
                              <>
                                <i className="fas fa-lock"></i> Reserved
                              </>
                            ) : isSelected ? (
                              <>
                                <i className="fas fa-check"></i> Selected
                              </>
                            ) : (
                              'Available'
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="step-action-bar">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentStep(1)}
              >
                <i className="fas fa-arrow-left"></i> Back to Services
              </button>

              <button
                className="btn btn-primary next-btn"
                onClick={handleNextFromDateTime}
                disabled={!selectedDate || !selectedTimeSlot}
              >
                Continue to Review <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: STEPS 6, 7, 8 - NOTES, SUMMARY & CONFIRMATION       */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="booking-step-container">
            <div className="step-header">
              <h2>Step 4: Additional Notes & Booking Summary</h2>
              <p>Review all appointment details and add any optional notes before booking.</p>
            </div>

            {/* Auth Warning if Not Logged In */}
            {!user && (
              <div className="auth-required-banner">
                <i className="fas fa-user-lock"></i>
                <div className="banner-content">
                  <h4>Account Login Required to Finalize</h4>
                  <p>
                    You are currently booking as a guest. Please sign in or create a free account so your appointment is tied to your profile and accessible in your dashboard.
                  </p>
                  <div className="banner-actions">
                    <Link to="/login" className="btn btn-primary btn-sm">
                      <i className="fas fa-sign-in-alt"></i> Login
                    </Link>
                    <Link to="/register" className="btn btn-outline btn-sm">
                      <i className="fas fa-user-plus"></i> Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="summary-split-grid">
              {/* Left Column: Notes & Patient Details */}
              <div className="notes-patient-column">
                <div className="card-box">
                  <h3>
                    <i className="fas fa-user-circle"></i> Patient Details
                  </h3>
                  {user ? (
                    <div className="patient-info-list">
                      <div className="info-row">
                        <span className="lbl">Name:</span>
                        <span className="val">
                          {profile?.full_name || user.user_metadata?.full_name || 'Patient'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="lbl">Email:</span>
                        <span className="val">{user.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="lbl">Phone:</span>
                        <span className="val">
                          {profile?.phone || user.user_metadata?.phone || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="guest-note">
                      Not logged in. You can still fill in your notes below and sign in when prompted.
                    </p>
                  )}
                </div>

                <div className="card-box" style={{ marginTop: '20px' }}>
                  <h3>
                    <i className="fas fa-sticky-note"></i> Additional Notes / Symptoms (Optional)
                  </h3>
                  <p className="input-hint">
                    Let the specialist know about specific symptoms, questions, or requests for your visit.
                  </p>
                  <textarea
                    rows="4"
                    className="notes-textarea"
                    placeholder="e.g. Experiencing mild headaches for 3 days, prefer morning consultation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Breakdown Card */}
              <div className="booking-summary-column">
                <div className="summary-card">
                  <div className="summary-card-header">
                    <h3>Booking Summary</h3>
                    <span className="status-badge">
                      <i className="fas fa-spinner fa-spin-pulse"></i> Pending Confirmation
                    </span>
                  </div>

                  <div className="summary-details">
                    <div className="summary-item">
                      <span className="s-label">Service</span>
                      <span className="s-value s-highlight">{selectedService?.name}</span>
                    </div>

                    <div className="summary-item">
                      <span className="s-label">Duration</span>
                      <span className="s-value">
                        <i className="far fa-clock"></i> {selectedService?.duration_minutes} Minutes
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="s-label">Date</span>
                      <span className="s-value">
                        <i className="far fa-calendar-alt"></i> {selectedDate}
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="s-label">Time Slot</span>
                      <span className="s-value">
                        <i className="fas fa-hourglass-start"></i> {selectedTimeSlot?.label}
                      </span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-item price-row">
                      <span className="s-label">Total Fee</span>
                      <span className="total-price">
                        ${Number(selectedService?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="summary-guarantee">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure Booking · Instant Sync with Database</span>
                  </div>

                  <button
                    className="btn btn-primary confirm-booking-btn"
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !user}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving Appointment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i> Confirm & Book Appointment
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="login-to-book-hint">
                      <i className="fas fa-lock"></i> Please log in or register above to confirm this booking.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="step-action-bar">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentStep(2)}
              >
                <i className="fas fa-arrow-left"></i> Back to Date & Time
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 4: STEP 10 - BOOKING SUCCESS SCREEN                    */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="booking-success-container">
            <div className="success-card">
              <div className="success-icon-wrapper">
                <i className="fas fa-check"></i>
              </div>

              <h2>Appointment Confirmed!</h2>
              <p className="success-subtitle">
                Your appointment has been successfully recorded in the Supabase database.
              </p>

              <div className="confirmed-ref-badge">
                <span>Appointment ID:</span>
                <strong>#{confirmedBooking?.id || 'APPT-' + Math.floor(Math.random() * 90000 + 10000)}</strong>
              </div>

              <div className="confirmed-details-box">
                <div className="conf-row">
                  <span className="conf-lbl">Service:</span>
                  <span className="conf-val">{selectedService?.name}</span>
                </div>
                <div className="conf-row">
                  <span className="conf-lbl">Date:</span>
                  <span className="conf-val">{selectedDate}</span>
                </div>
                <div className="conf-row">
                  <span className="conf-lbl">Time Slot:</span>
                  <span className="conf-val">{selectedTimeSlot?.label}</span>
                </div>
                <div className="conf-row">
                  <span className="conf-lbl">Status:</span>
                  <span className="conf-val status-confirmed">
                    <i className="fas fa-check-circle"></i> Confirmed
                  </span>
                </div>
                {notes && (
                  <div className="conf-row">
                    <span className="conf-lbl">Notes:</span>
                    <span className="conf-val conf-notes">"{notes}"</span>
                  </div>
                )}
              </div>

              <div className="success-actions">
                <Link to="/dashboard" className="btn btn-primary">
                  <i className="fas fa-columns"></i> View in My Dashboard
                </Link>
                <button onClick={handleBookAnother} className="btn btn-outline">
                  <i className="fas fa-plus-circle"></i> Book Another Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default BookingPage
