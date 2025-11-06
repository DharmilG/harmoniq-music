import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './apiClient'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Start with loading true for session check
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message }
  const navigate = useNavigate()

  // Helpers
  const showToast = useCallback((message, type='success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { user: updatedUser } = await api('/api/auth/me');
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { user: sessionUser } = await api('/api/auth/me');
        setUser(sessionUser);
      } catch (error) {
        // No user session, which is normal.
        // The api client will handle 401s and won't throw for them by default.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error("Logout failed", e)
    } finally {
      setUser(null)
      showToast('Signed out', 'success')
    }
  }, [showToast, navigate])

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { user } = await api('/api/auth/register', {
        method: 'POST', body: { name, email, password }
      })
      setUser(user);
      showToast('Registration successful! You are now signed in.', 'success')
      navigate('/', { replace: true })
      return { user };
    } finally {
      setLoading(false)
    }
  }, [showToast, navigate]);

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error('Please enter valid credentials')
    setLoading(true)
    try {
      const response = await api('/api/auth/login', {
        method: 'POST', body: { email, password },
      })
      setUser(response.user)
      showToast('Sign in successful!', 'success')
      navigate('/', { replace: true })
      // The token is handled by httpOnly cookie, not exposed to client-side JS
      return { user: response.user }
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  const signInWithGoogleCredential = useCallback(async (credential) => {
    setLoading(true)
    try {
      const { user } = await api('/api/auth/google-signin', {
        method: 'POST',
        body: { token: credential }
      })
      setUser(user)
      showToast('Sign in with Google successful!', 'success')
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  const updateProfile = useCallback(async (data) => {
    setLoading(true)
    try {
      const { user: updatedUser } = await api('/api/users/me', {
        method: 'PATCH',
        body: data,
      })
      setUser(updatedUser)
      showToast('Profile updated successfully!', 'success')
      return updatedUser
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    setLoading(true)
    try {
      const response = await api('/api/users/me/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword },
      })
      showToast(response.message || 'Password changed successfully!', 'success')
      return response
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const deleteAccount = useCallback(async () => {
    setLoading(true)
    try {
      await api('/api/users/me', { method: 'DELETE' })
      setUser(null)
      showToast('Your account has been deleted.', 'success')
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [showToast, navigate])

  const forgotPassword = useCallback(async (email) => {
    const response = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
    return response
  }, [])

  const getGamificationStats = useCallback(async () => {
    const response = await api('/api/gamification/stats');
    return response;
  }, []);

  const logActivity = useCallback(async ({ type, pointsEarned, tokensEarned = 0 }) => {
    const response = await api('/api/activity/log', {
      method: 'POST',
      body: { type, pointsEarned, tokensEarned },
    });
    // This part is for a future level-up modal feature, but it's safe to have.
    // if (response.levelUpInfo) {
    //   setLevelUpModal(response.levelUpInfo);
    // }
    return response;
  }, []);

  const verifyResetCode = useCallback(async ({ email, code }) => {
    const response = await api('/api/auth/verify-reset-code', {
      method: 'POST',
      body: { email, code },
    })
    return response
  }, [])

  const resetPassword = useCallback(async ({ token, password }) => {
    const response = await api('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
    return response
  }, [])

  const value = useMemo(() => ({
    user,
    token: null,
    loading,
    login,
    register,
    logout,
    signInWithGoogleCredential,
    updateProfile,
    changePassword,
    forgotPassword,
    logActivity,
    getGamificationStats,
    verifyResetCode,
    resetPassword,
    deleteAccount,
    isAuthenticated: !!user,
    refreshUser, // Expose the new function
    toast,
  }), [user, loading, login, register, logout, signInWithGoogleCredential, updateProfile, changePassword, forgotPassword, logActivity, getGamificationStats, verifyResetCode, resetPassword, deleteAccount, toast, showToast, refreshUser])
  
  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && (
        <div style={{ position: 'fixed', right: '1rem', bottom: '1rem', zIndex: 2000, maxWidth: '320px' }}>
          <div className={`alert ${toast.type === 'success' ? 'success' : 'error'}`} role="status">
            {toast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}