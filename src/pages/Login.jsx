import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || document.querySelector('meta[name="google-client-id"]')?.getAttribute('content')
export default function Login(){
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed')
    }
  }


  return (
    <section>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Welcome back</h2>
        <p className="small muted" style={{ margin: 'var(--space-xs) 0 var(--space-lg)' }}>Sign in to continue your musical journey.</p>

        {error && <div className="alert error" role="alert">{error}</div>}
        <form onSubmit={onSubmit} className="card" noValidate disabled={loading}>
          {/* ... your email/password form ... */}
          <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
              <div style={{ textAlign: 'right', marginTop: 'var(--space-xs)' }}>
                <Link to="/forgot-password" className="small link-accent">Forgot password?</Link>
              </div>
            </div>
            <button className="btn primary" type="submit" style={{ width: '100%' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
        </form>

        <div className="divider"><span>or</span></div>

        <GoogleSignInButton clientId={GOOGLE_CLIENT_ID} onError={(e)=>setError(e.message || 'Google sign-in failed')} disabled={loading} />

        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
          New here? <Link to="/register" className="link-accent">Create an account</Link>
        </p>
      </div>
    </section>
  )
}