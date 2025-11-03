import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles.css'

const GOOGLE_CLIENT_ID = "694482586292-tjf93hs8smh4asbni2rdfknhoesq8h9o.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      </GoogleOAuthProvider>
    </HashRouter>
  </React.StrictMode>
)

