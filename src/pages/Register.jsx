import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register(){
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ name, email, password })
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2>Create your account</h2>
        <p className="small muted" style={{ margin: 'var(--space-xs) 0 var(--space-lg)' }}>
          Join Harmoniq and start learning today.
        </p>

        {error && <div className="alert error" role="alert">{error}</div>}

        <form onSubmit={onSubmit} className="card" noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="At least 6 characters" minLength={6} />
          </div>
          <button className="btn primary" disabled={submitting} type="submit" style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
          Already have an account? <Link to="/login" className="link-accent">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

