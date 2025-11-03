import { useState } from 'react'

export default function Contact(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactMethods = [
    {
      title: 'Email Us',
      value: 'hello@harmoniq.example',
      description: 'Send us an email anytime'
    },
    {
      title: 'Call Us',
      value: '+1 (555) 010-2025',
      description: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      title: 'Visit Us',
      value: '123 Harmony Ave, Suite 5',
      description: 'Your City, State 12345'
    }
  ]

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2>Get In Touch</h2>
        <p className="small">
          Have questions about lessons, instruments, or partnerships? We'd love to hear from you!
          Send us a message and we'll get back to you within 1 business day.
        </p>
      </div>

      <div className="contact-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-2xl)',
        alignItems: 'start'
      }}>
        <form
          className="card"
          onSubmit={handleSubmit}
          style={{
            background: 'var(--gradient-glass)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <h3>Send us a Message</h3>

          <div className="row">
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                className="input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            className="input"
            placeholder="Lesson inquiry, instrument question, etc."
            value={formData.subject}
            onChange={handleChange}
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            className="input"
            placeholder="Tell us how we can help you on your musical journey..."
            value={formData.message}
            onChange={handleChange}
          />

          <div className="actions" style={{marginTop: 'var(--space-lg)'}}>
            <button
              type="submit"
              className={`btn primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : submitted ? 'Sent!' : 'Send Message'}
            </button>
          </div>
        </form>

        <div>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Other Ways to Reach Us</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {contactMethods.map((method, index) => (
              <div
                key={method.title}
                className="card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  padding: 'var(--space-lg)'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, marginBottom: 'var(--space-xs)' }}>{method.title}</h4>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {method.value}
                  </div>
                  <div className="small" style={{ color: 'var(--text-muted)' }}>
                    {method.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{
            marginTop: 'var(--space-xl)',
            textAlign: 'center',
            background: 'var(--gradient-surface)'
          }}>
            <h4>Office Hours</h4>
            <div className="small">
              <p><strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM</p>
              <p><strong>Saturday:</strong> 10:00 AM - 6:00 PM</p>
              <p><strong>Sunday:</strong> 12:00 PM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}