import { useState } from 'react'

export default function LessonBooking({ course, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    preferredDays: [],
    preferredTimes: [],
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const experienceLevels = [
    'Complete Beginner',
    'Some Basic Knowledge',
    'Intermediate',
    'Advanced',
    'Professional'
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
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
      <div className="card" style={{
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        background: 'var(--gradient-glass)',
        border: '1px solid rgba(34, 197, 94, 0.3)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: 'var(--space-lg)',
          color: 'var(--success)'
        }}>
          ✓
        </div>
        <h3>Enrollment Request Submitted!</h3>
        <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
          Thank you for your interest in {course.instrument} lessons. We'll contact you within 24 hours to confirm your enrollment and schedule your first lesson.
        </p>
        <div className="actions">
          <button 
            className="btn primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{
      maxWidth: '600px',
      margin: '0 auto',
      background: 'var(--gradient-glass)',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h3>Enroll in {course.instrument} - {course.level}</h3>
        <button 
          className="btn"
          onClick={onClose}
          style={{ padding: 'var(--space-xs)' }}
        >
          ×
        </button>
      </div>

      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <span className="small"><strong>Duration:</strong> {course.duration}</span>
          <span className="small"><strong>Price:</strong> ${course.price}</span>
        </div>
        <p className="small" style={{ margin: 0 }}>{course.summary}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-md)',
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
            <label htmlFor="experience" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
              Experience Level *
            </label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
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
              <option value="">Select your level</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="small" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
            Preferred Days (select all that apply) *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--space-sm)'
          }}>
            {days.map(day => (
              <label key={day} style={{
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
                  name="preferredDays"
                  value={day}
                  checked={formData.preferredDays.includes(day)}
                  onChange={handleInputChange}
                  style={{ margin: 0 }}
                />
                <span className="small">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="small" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
            Preferred Times (select all that apply) *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 'var(--space-sm)'
          }}>
            {timeSlots.map(time => (
              <label key={time} style={{
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
                  name="preferredTimes"
                  value={time}
                  checked={formData.preferredTimes.includes(time)}
                  onChange={handleInputChange}
                  style={{ margin: 0 }}
                />
                <span className="small">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label htmlFor="message" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
            Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows="3"
            placeholder="Tell us about your musical goals, any specific areas you'd like to focus on, or questions you have..."
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
            {isSubmitting ? 'Submitting...' : 'Enroll Now'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

