import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifyResetCode() {
  const { verifyResetCode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // The email should be passed from the ForgotPassword page
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { grant_token } = await verifyResetCode({ email, code })
      // On success, navigate to the reset password page with the grant token
      navigate(`/reset-password?token=${grant_token}`)
    } catch (e) {
      setError(e.message || 'Failed to verify code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Enter Verification Code</h2>
        <p className="small muted" style={{ margin: 'var(--space-xs) 0 var(--space-lg)' }}>
          A 6-digit code was sent to {email ? <strong>{email}</strong> : 'your email'}.
          Check your console for the code.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="code">Verification Code</label>
            <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="123456" maxLength={6} />
          </div>
          <button className="btn primary" disabled={loading} type="submit" style={{ width: '100%' }}>{loading ? 'Verifying...' : 'Verify Code'}</button>
        </form>
        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}><Link to="/forgot-password" className="link-accent">Request a new code</Link></p>
      </div>
    </section>
  )
}