import { useState } from 'react'

export default function TourBooking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    groupSize: 1,
    interests: [],
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  const interestOptions = [
    'Guitar Lessons', 'Piano Lessons', 'Drum Lessons', 'Voice Training',
    'Music Theory', 'Performance Opportunities', 'Instrument Store',
    'Recording Studio', 'Group Classes', 'Private Lessons'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interests: checked 
          ? [...prev.interests, value]
          : prev.interests.filter(interest => interest !== value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <section>
        <div className="card" style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: 'var(--space-2xl) auto',
          background: 'var(--gradient-glass)',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: 'var(--space-lg)',
            color: 'var(--success)'
          }}>
            ✓
          </div>
          <h2>Tour Request Submitted!</h2>
          <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
            Thank you for your interest in Harmoniq Music Academy. We've received your tour request and will contact you within 24 hours to confirm your visit.
          </p>
          <div className="actions">
            <button 
              className="btn primary"
              onClick={() => setIsSubmitted(false)}
            >
              Book Another Tour
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>Schedule a Tour</h2>
        <p className="small">
          Experience our state-of-the-art facilities, meet our instructors, and see why Harmoniq is the perfect place for your musical journey.
        </p>
      </div>

      <div className="card" style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--gradient-glass)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h3>Tour Information</h3>
        <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
          Our tours typically last 30-45 minutes and include:
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 var(--space-xl) 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-sm)'
        }}>
          <li className="small" style={{
            padding: 'var(--space-sm)',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent-primary)'
          }}>
            • Studio facilities tour
          </li>
          <li className="small" style={{
            padding: 'var(--space-sm)',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent-primary)'
          }}>
            • Meet our instructors
          </li>
          <li className="small" style={{
            padding: 'var(--space-sm)',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent-primary)'
          }}>
            • Instrument demonstration
          </li>
          <li className="small" style={{
            padding: 'var(--space-sm)',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent-primary)'
          }}>
            • Q&A session
          </li>
        </ul>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div>
              <label htmlFor="name" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="email" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="phone" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="groupSize" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Group Size
              </label>
              <select
                id="groupSize"
                name="groupSize"
                value={formData.groupSize}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferredDate" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Preferred Date *
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="preferredTime" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Preferred Time *
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                required
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="">Select a time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label className="small" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
              Areas of Interest (select all that apply)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-sm)'
            }}>
              {interestOptions.map(interest => (
                <label key={interest} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input
                    type="checkbox"
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={handleInputChange}
                    style={{ margin: 0 }}
                  />
                  <span className="small">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label htmlFor="message" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
              Additional Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us about your musical background, goals, or any specific questions you have..."
              style={{
                width: '100%',
                background: 'var(--surface-elevated)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-sm) var(--space-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
              style={{ minWidth: '150px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Request Tour'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

