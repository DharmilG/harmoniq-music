import React, { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// This component loads Google Identity Services button
// Requires a Google OAuth 2.0 Client ID configured for Web and added to index.html meta or env
export default function GoogleSignInButton({ clientId, onError, disabled }){
  const { signInWithGoogleCredential, loading } = useAuth()
  const divRef = useRef(null)

  useEffect(() => {
    if(!clientId) return
    if (disabled) return
    // Load Google script if not present
    const id = 'google-identity'
    let script = document.getElementById(id)
    if(!script){
      script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.id = id
      document.head.appendChild(script)
    }

    function initialize(){
      if(!window.google || !window.google.accounts || !window.google.accounts.id) return false
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await signInWithGoogleCredential(response.credential)
          } catch (e) {
            onError?.(e)
          }
        },
        auto_select: false,
        context: 'signin',
      })
      if(divRef.current){
        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        })
      }
      return true
    }

    let tries = 0
    const t = setInterval(() => {
      tries++
      if(initialize() || tries > 20){
        clearInterval(t)
      }
    }, 100)

    return () => clearInterval(t)
  }, [clientId, signInWithGoogleCredential, onError])
  
  const buttonStyle = {
    display: 'inline-block',
    width: '100%',
    transition: 'opacity 0.2s',
    opacity: disabled ? 0.65 : 1,
    cursor: disabled ? 'wait' : 'pointer',
    position: 'relative',
  }
  return (
    <div style={buttonStyle}>
      {disabled && <div className="spinner-overlay"><div className="spinner-dual-ring" /></div>}
      <div ref={divRef} style={{ pointerEvents: disabled ? 'none' : 'auto' }} />
    </div>
  )
}