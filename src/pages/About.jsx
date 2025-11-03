import { Link } from 'react-router-dom'

export default function About(){
  const values = [
    {
      title: 'Our Mission',
      description: 'Make high-quality music education accessible and inspiring for all ages and backgrounds, fostering creativity and musical expression.'
    },
    {
      title: 'Our Method',
      description: 'A perfect blend of music theory, ear training, and real-world performance experience, taught by active professional musicians.'
    },
    {
      title: 'Our Facilities',
      description: 'State-of-the-art studios equipped with premium Yamaha instruments, professional audio gear, and comfortable learning environments.'
    },
    {
      title: 'Our Vision',
      description: 'To become the leading music education platform that bridges the gap between learning and professional performance.'
    }
  ]

  const stats = [
    { number: '500+', label: 'Active Students' },
    { number: '15+', label: 'Expert Instructors' },
    { number: '8', label: 'Instruments Taught' },
    { number: '95%', label: 'Student Satisfaction' }
  ]

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2>About Harmoniq</h2>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Harmoniq is a modern music education startup dedicated to helping students learn faster and enjoy the journey.
          Our innovative pathways combine structured curricula, performance opportunities, and access to premium instruments,
          all powered by strategic partnerships with industry leaders.
        </p>
      </div>

      <div className="card" style={{
        marginBottom: 'var(--space-2xl)',
        background: 'var(--gradient-glass)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        textAlign: 'center'
      }}>
        <h3>Our Impact</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-lg)',
          marginTop: 'var(--space-lg)'
        }}>
          {stats.map((stat, index) => (
            <div key={stat.label} style={{
              animationDelay: `${index * 0.1}s`
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--accent-primary)',
                marginBottom: 'var(--space-xs)'
              }}>
                {stat.number}
              </div>
              <div className="small" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ marginBottom: 'var(--space-xl)' }}>What Drives Us</h3>
      <div className="grid">
        {values.map((value, index) => (
          <div
            key={value.title}
            className="card"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <h3>{value.title}</h3>
            <p className="small">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{
        marginTop: 'var(--space-2xl)',
        background: 'var(--gradient-surface)',
        textAlign: 'center'
      }}>
        <h3>Join Our Community</h3>
        <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
          Ready to start your musical journey? Whether you're a complete beginner or looking to refine your skills,
          we have the perfect program for you.
        </p>
        <div className="actions">
          <Link to="/lessons" className="btn primary">
            Start Learning Today
          </Link>
          <Link to="/tour-booking" className="btn">
            Schedule a Tour
          </Link>
        </div>
      </div>
    </section>
  )
}

