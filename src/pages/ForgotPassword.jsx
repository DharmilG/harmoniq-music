import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await forgotPassword(email)
      // On success, navigate to the code verification page
      navigate('/verify-reset-code', { state: { email } })
    } catch (e) {
      setError(e.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Forgot Password</h2>
        <p className="small muted" style={{ margin: 'var(--space-xs) 0 var(--space-lg)' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <form onSubmit={handleSubmit} className="card">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <button className="btn primary" disabled={loading} type="submit" style={{ width: '100%' }}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
        </form>
        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}><Link to="/login" className="link-accent">Back to Login</Link></p>
      </div>
    </section>
  )
}