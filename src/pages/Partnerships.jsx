import { Link } from 'react-router-dom'

export default function Partnerships(){
  const partnerships = [
    {
      name: 'Red Bull',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/RedBullEnergyDrink.svg/1200px-RedBullEnergyDrink.svg.png',
      description: 'Artist showcases, performance workshops, and student competitions powered by Red Bull.',
      benefits: [
        'Monthly artist showcases and open mic nights',
        'Annual student competition with cash prizes',
        'Exclusive workshops with Red Bull Music artists',
        'Performance opportunities at Red Bull events'
      ],
      color: '#DC143C',
      website: 'https://www.redbull.com/in-en/tags/music'
    },
    {
      name: 'Yamaha',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxaquiBBHt2jzwKQdvE05pB9bu1OeDIpNM3g&s',
      description: 'Exclusive gear demos, educator training, and student discounts on select Yamaha instruments.',
      benefits: [
        'Access to latest Yamaha instruments for practice',
        'Student discounts up to 25% on select gear',
        'Professional development for our instructors',
        'Free maintenance and setup for student instruments'
      ],
      color: '#1E40AF',
      website: 'https://yamahamusicstore.in/?utm_source=google-ads&utm_campaign=21550776149&utm_adgroup=&utm_term=&utm_device=c&utm_asset={assetid}&gad_source=1&gad_campaignid=21544337244&gbraid=0AAAAADqeUVCmxc1sJ4ei0qB34lcmmmbNd&gclid=CjwKCAjw_fnFBhB0EiwAH_MfZiYBE4AR1JGdJbY92k1POeTDgJRIhdSbTcxrHLN9txEuKY-qQ6np-RoC48gQAvD_BwE'
    },
    {
      name: 'Trinity Music',
      logo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Trinity_College_London_-_Logo.png',
      description: 'Internationally recognized music examinations and certification programs for students of all levels.',
      benefits: [
        'Internationally recognized music qualifications',
        'Structured learning pathways from beginner to advanced',
        'Performance and theory examination opportunities',
        'Global recognition for musical achievements'
      ],
      color: '#8B4513',
      website: 'https://www.trinitycollege.com/qualifications/music'
    }
  ]

  const handleLearnMore = (website) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  }

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>Strategic Partnerships</h2>
        <p className="small">
          We collaborate with industry leaders to create unique learning experiences,
          exclusive opportunities, and real-world connections for our students.
        </p>
      </div>

      <ul className="grid" style={{marginTop: 'var(--space-xl)'}}>
        {partnerships.map((partner, index) => (
          <li
            key={partner.name}
            className="card"
            style={{
              animationDelay: `${index * 0.2}s`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: partner.color,
              opacity: 0.8
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <img
                src={partner.logo}
                alt={partner.name}
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm)',
                  objectFit: 'contain'
                }}
              />
              <h3 style={{ margin: 0, color: partner.color }}>{partner.name}</h3>
            </div>

            <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
              {partner.description}
            </p>

            <div>
              <h4 style={{
                fontSize: '1rem',
                marginBottom: 'var(--space-md)',
                color: 'var(--text-primary)'
              }}>
                Student Benefits:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)'
              }}>
                {partner.benefits.map((benefit, benefitIndex) => (
                  <li
                    key={benefitIndex}
                    className="small"
                    style={{
                      padding: 'var(--space-sm)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `3px solid ${partner.color}`,
                      animation: `fadeInUp var(--transition-normal) ease-out ${0.5 + benefitIndex * 0.1}s both`
                    }}
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="actions" style={{ marginTop: 'var(--space-lg)' }}>
              <button 
                className="btn primary"
                onClick={() => handleLearnMore(partner.website)}
              >
                Learn More
              </button>
              <Link to="/tour-booking" className="btn">
                Schedule Demo
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="card" style={{
        marginTop: 'var(--space-2xl)',
        textAlign: 'center',
        background: 'var(--gradient-glass)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h3>Partnership Opportunities</h3>
        <p className="small">
          Are you a music industry professional or company interested in partnering with Harmoniq?
          We're always looking for new ways to enhance our students' learning experience.
        </p>
        <div className="actions" style={{ marginTop: 'var(--space-lg)' }}>
          <button className="btn primary">
            Partner With Us
          </button>
        </div>
      </div>
    </section>
  )
}

