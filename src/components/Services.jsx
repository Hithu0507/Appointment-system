import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getActiveServices } from '../lib/bookingApi'
import './Services.css'

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const res = await getActiveServices()
      if (mounted) {
        setServices(res.data)
        setIsFallback(res.isFallback)
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleBookNow = (serviceId) => {
    navigate(`/booking?service=${serviceId}`)
  }

  const getServiceIcon = (name = '') => {
    const lower = name.toLowerCase()
    if (lower.includes('dental')) return 'fa-tooth'
    if (lower.includes('heart') || lower.includes('cardio')) return 'fa-heartbeat'
    if (lower.includes('skin') || lower.includes('derm')) return 'fa-spa'
    if (lower.includes('mental') || lower.includes('therapy')) return 'fa-brain'
    if (lower.includes('checkup') || lower.includes('body')) return 'fa-stethoscope'
    return 'fa-user-md'
  }

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        
        {/* Heading */}
        <div className="services-heading">
          <span className="badge-pill">
            <i className="fas fa-stethoscope"></i> SPECIALIZED CARE
          </span>
          <h2>Explore Our Services & Pricing</h2>
          <p>
            Certified healthcare and consultation services tailored to your personal schedule. Pick a service to view availability and book instantly.
          </p>
        </div>

        {/* Database notice if services table is not yet seeded */}
        {isFallback && !loading && (
          <div className="db-notice-banner">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Database Notice:</strong> Showing default services. To fetch directly from your Supabase database, execute the queries in <code>supabase-schema-setup.sql</code> in your Supabase SQL editor to seed the <code>services</code> table.
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="services-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading available services from Supabase...</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                
                {/* Image & Category Tag */}
                <div className="service-card-header">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="service-img" />
                  ) : (
                    <div className="service-img-placeholder">
                      <i className={`fas ${getServiceIcon(service.name)}`}></i>
                    </div>
                  )}
                  <span className="duration-tag">
                    <i className="far fa-clock"></i> {service.duration_minutes || 60} mins
                  </span>
                </div>

                {/* Content */}
                <div className="service-card-body">
                  <div className="service-header-row">
                    <div className="service-icon-box">
                      <i className={`fas ${getServiceIcon(service.name)}`}></i>
                    </div>
                    <div className="service-price">
                      ${Number(service.price).toFixed(2)}
                      <span>/ visit</span>
                    </div>
                  </div>

                  <h3>{service.name}</h3>
                  <p>{service.description}</p>

                  <div className="service-features-mini">
                    <span><i className="fas fa-check"></i> Instant Booking</span>
                    <span><i className="fas fa-check"></i> Verified Specialist</span>
                  </div>

                  {/* Actions */}
                  <div className="service-actions">
                    <button
                      className="btn-details"
                      onClick={() => setSelectedService(service)}
                    >
                      <i className="fas fa-eye"></i> Details
                    </button>
                    <button
                      className="btn-book"
                      onClick={() => handleBookNow(service.id)}
                    >
                      Book Now <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="service-modal-backdrop" onClick={() => setSelectedService(null)}>
          <div className="service-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedService(null)}>
              <i className="fas fa-times"></i>
            </button>

            <div className="modal-content">
              {selectedService.image_url && (
                <img
                  src={selectedService.image_url}
                  alt={selectedService.name}
                  className="modal-banner-img"
                />
              )}

              <div className="modal-body">
                <div className="modal-meta-row">
                  <span className="modal-badge">
                    <i className="far fa-clock"></i> {selectedService.duration_minutes} Minutes
                  </span>
                  <span className="modal-price">
                    ${Number(selectedService.price).toFixed(2)}
                  </span>
                </div>

                <h3>{selectedService.name}</h3>
                <p className="modal-desc">{selectedService.description}</p>

                <div className="modal-included-section">
                  <h4>What's Included:</h4>
                  <ul>
                    <li><i className="fas fa-check-circle"></i> One-on-one session with a certified practitioner</li>
                    <li><i className="fas fa-check-circle"></i> Digital appointment records & notes</li>
                    <li><i className="fas fa-check-circle"></i> Free cancellation up to your appointment time</li>
                    <li><i className="fas fa-check-circle"></i> Direct post-consultation prescription or summary</li>
                  </ul>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedService(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const id = selectedService.id
                      setSelectedService(null)
                      handleBookNow(id)
                    }}
                  >
                    Proceed to Booking <i className="fas fa-calendar-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Services
