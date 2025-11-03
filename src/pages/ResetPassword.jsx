import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const query = useQuery()
  const token = query.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }
    if (!token) {
      return setError("Invalid or missing reset token.")
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { message: successMessage } = await resetPassword({ token, password })
      setMessage(successMessage + ' Redirecting to login...')
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      setError(e.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Reset Your Password</h2>
        <p className="small muted" style={{ margin: 'var(--space-xs) 0 var(--space-lg)' }}>
          Enter your new password below.
        </p>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>} 

        <form onSubmit={handleSubmit} className="card">
          <div className="field">
            <label htmlFor="password">New Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button className="btn primary" disabled={loading || !token} type="submit" style={{ width: '100%' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        {!token && <div className="alert error" style={{marginTop: 'var(--space-md)'}}>No reset token found. Please <Link to="/forgot-password" className="link-accent">request a new code</Link>.</div>}
      </div>
    </section>
  )
}