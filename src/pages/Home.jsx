import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Home(){
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      title: 'Guided Pathways',
      description: 'Beginner to advanced courses with clear outcomes and structured progression.'
    },
    {
      title: 'Pro Instructors',
      description: 'Active performers and seasoned educators with real-world experience.'
    },
    {
      title: 'Industry Perks',
      description: 'Exclusive workshops and opportunities with Red Bull and Yamaha.'
    },
    {
      title: 'Flexible Scheduling',
      description: 'Online and on-campus options that fit your lifestyle.'
    }
  ]

  return (
    <section className="hero">
      <div>
        <div className="badge">Harmoniq Music Academy</div>
        <h1>Learn. Play. Perform.</h1>
        <p>
          Modern music education powered by expert mentors and industry partnerships with
          <strong style={{ color: 'var(--accent-secondary)' }}> Red Bull</strong> and
          <strong style={{ color: 'var(--accent-primary)' }}> Yamaha</strong>.
          Explore lessons across instruments, then gear up in our curated store.
        </p>
        <div className="actions">
          <Link to="/lessons" className="btn primary">
            Explore Lessons
          </Link>
          <Link to="/store" className="btn">
            Shop Instruments
          </Link>
        </div>
      </div>

      <div className="panel">
        <ul className="grid">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className="card"
              style={{
                animationDelay: `${0.8 + index * 0.1}s`,
                opacity: isVisible ? 1 : 0
              }}
            >
              <h3>{feature.title}</h3>
              <p className="small">{feature.description}</p>
            </li>
          ))}
        </ul>

        <div style={{
          marginTop: 'var(--space-xl)',
          textAlign: 'center',
          animation: 'fadeInUp var(--transition-slow) ease-out 1.2s both'
        }}>
          <p className="small" style={{ color: 'var(--text-muted)' }}>
            Join over 500+ students already learning with us
          </p>
        </div>
      </div>
    </section>
  )
}

