import React from 'react'
import './Testimonials.css'

function Testimonials() {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'General Consultation Patient',
      rating: 5,
      comment: 'Booking my appointment took less than two minutes! No waiting on hold, and I received instant confirmation. The clinic was ready right at my time slot.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      service: 'General Consultation',
    },
    {
      name: 'Michael Chen',
      role: 'Dental Care Client',
      rating: 5,
      comment: 'The calendar interface is super clean and prevented any scheduling conflicts. I also loved being able to manage and check my booking history right in my dashboard.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      service: 'Dental Care & Checkup',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Dermatology Patient',
      rating: 5,
      comment: 'Appointly made scheduling so stress-free. The doctor was attentive, and having my notes saved right in the appointment record made the consultation so smooth.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      service: 'Dermatology & Skin Care',
    },
  ]

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-container">
        
        <div className="testimonials-header">
          <span className="badge-pill">
            <i className="fas fa-comment-alt"></i> TESTIMONIALS
          </span>
          <h2>What Our Patients Say</h2>
          <p>
            Real feedback from thousands of satisfied patients who rely on Appointly for reliable, verified appointment bookings.
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((r, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>

              <div className="rating-stars">
                {[...Array(r.rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>

              <p className="testimonial-text">"{r.comment}"</p>

              <div className="testimonial-author">
                <img src={r.avatar} alt={r.name} className="author-avatar" />
                <div className="author-details">
                  <h4>{r.name}</h4>
                  <span>{r.role}</span>
                  <span className="service-tag">
                    <i className="fas fa-check-circle"></i> {r.service}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Testimonials
