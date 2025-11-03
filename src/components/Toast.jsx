import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Toast() {
  const { toast } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 2700) // Start fade-out slightly before it's removed
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [toast])

  if (!toast) return null

  return (
    <div className={`toast-container ${visible ? 'visible' : ''}`}>
      <div className={`alert ${toast.type === 'success' ? 'success' : 'error'}`} role="status">
        {toast.message}
      </div>
    </div>
  )
}