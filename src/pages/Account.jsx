import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// A selection of cool avatars for users to choose from
const avatarOptions = [
  'https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi',
  'https://api.dicebear.com/8.x/adventurer/svg?seed=Bandit',
  'https://api.dicebear.com/8.x/adventurer/svg?seed=Loki',
  'https://api.dicebear.com/8.x/adventurer/svg?seed=Coco',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Gizmo',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Zoe',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Max',
  'https://api.dicebear.com/8.x/bottts/svg?seed=Annie',
  'https://api.dicebear.com/8.x/micah/svg?seed=Lucy',
  'https://api.dicebear.com/8.x/micah/svg?seed=Leo',
  'https://api.dicebear.com/8.x/micah/svg?seed=Milo',
  'https://api.dicebear.com/8.x/micah/svg?seed=Cleo',
]

// Hardcoded levels based on backend schema (computed on frontend using points)
const levels = [
  { level: 1, name: 'Beginner', pointsRequired: 0 },
  { level: 2, name: 'Novice', pointsRequired: 1000 },
  { level: 3, name: 'Apprentice', pointsRequired: 2500 },
  { level: 4, name: 'Adept', pointsRequired: 5000 },
  { level: 5, name: 'Virtuoso', pointsRequired: 10000 },
  { level: 6, name: 'Expert', pointsRequired: 20000 },
  { level: 7, name: 'Master', pointsRequired: 40000 },
  { level: 8, name: 'Grandmaster', pointsRequired: 80000 },
  { level: 9, name: 'Legend', pointsRequired: 150000 },
  { level: 10, name: 'Maestro', pointsRequired: 300000 },
]

export default function Account(){
  const { user, updateProfile, changePassword, deleteAccount, logout, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  // Edit profile form state
  const [name, setName] = useState(user?.name || '')
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [addressLine1, setAddressLine1] = useState(user?.address_line1 || '')
  const [city, setCity] = useState(user?.city || '')
  const [zipCode, setZipCode] = useState(user?.zip_code || '')
  const [country, setCountry] = useState(user?.country || '')
  const [avatar, setAvatar] = useState(user?.avatar_url || '')

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Compute current level based on points
  const currentLevel = useMemo(() => {
    return levels.findLast(l => (user?.points || 0) >= l.pointsRequired) || levels[0]
  }, [user?.points])

  const handleEdit = () => {
    setName(user.name || '')
    setFirstName(user.first_name || '')
    setLastName(user.last_name || '')
    setPhone(user.phone || '')
    setAddressLine1(user.address_line1 || '')
    setCity(user.city || '')
    setZipCode(user.zip_code || '')
    setCountry(user.country || '')
    setAvatar(user.avatar_url || '')
    setIsEditing(true)
    setError('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

  const handleSave = async () => {
    setError('')
    const dataToUpdate = {}

    // Handle full name update based on first/last if they are set
    let fullName = name
    if (firstName || lastName) {
      fullName = `${firstName} ${lastName}`.trim()
      if (!fullName) fullName = name // Fallback to original if both empty
    }
    if (fullName !== user.name) dataToUpdate.name = fullName

    // Add other fields if changed
    if (firstName !== user.first_name) dataToUpdate.first_name = firstName
    if (lastName !== user.last_name) dataToUpdate.last_name = lastName
    if (phone !== user.phone) dataToUpdate.phone = phone
    if (addressLine1 !== user.address_line1) dataToUpdate.address_line1 = addressLine1
    if (city !== user.city) dataToUpdate.city = city
    if (zipCode !== user.zip_code) dataToUpdate.zip_code = zipCode
    if (country !== user.country) dataToUpdate.country = country
    if (avatar !== user.avatar_url) dataToUpdate.avatar_url = avatar

    if (Object.keys(dataToUpdate).length === 0) {
      setIsEditing(false)
      return
    }

    try {
      await updateProfile(dataToUpdate)
      setIsEditing(false)
    } catch (e) {
      setError(e.message || 'Failed to update profile.')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.")
      return
    }

    try {
      await changePassword({ currentPassword, newPassword })
      setPasswordSuccess('Your password has been updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setPasswordError(e.message || 'Failed to change password.')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      // The context will handle navigation
    } catch (e) {
      setError(e.message || 'Failed to delete account.')
    }
  }

  return (
    <section>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2>Your Account</h2>

        {error && <div className="alert error">{error}</div>}

        <div className="card">
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
            <img src={isEditing ? avatar : user?.avatar_url} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', background: 'var(--surface-elevated)' }} />
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div className="field">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
                </div>
              ) : (
                <>
                  <div><strong>{user?.name}</strong></div>
                  <div className="small">{user?.email}</div>
                  <div className="small muted">Signed in with {user?.provider}</div>
                </>
              )}
            </div>
            {!isEditing && <button className="btn" onClick={handleEdit} disabled={loading}>Edit Profile</button>}
          </div>

          {/* Profile Progress Bar */}
          {!isEditing && user && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                <span>Profile Completion</span>
                <span className="small">{user.profile_completed}%</span>
              </div>
              <div style={{ 
                height: 8, 
                background: 'var(--surface-elevated)', 
                borderRadius: 4, 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${user.profile_completed}%`, 
                  background: 'var(--accent-primary)', 
                  transition: 'width 0.3s ease' 
                }}></div>
              </div>
            </div>
          )}


          {isEditing && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              {/* Basic Info */}
              <h4>Basic Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="field">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={loading} />
              </div>

              {/* Address */}
              <h4 style={{ marginTop: 'var(--space-xl)' }}>Address</h4>
              <div className="field">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input id="addressLine1" type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} disabled={loading} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} disabled={loading} />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input id="zipCode" type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input id="country" type="text" value={country} onChange={e => setCountry(e.target.value)} disabled={loading} />
              </div>

              {/* Avatar Selection */}
              <h4 style={{ marginTop: 'var(--space-xl)' }}>Avatar</h4>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                {avatarOptions.map(url => (
                  <img key={url} src={url} alt="avatar option" onClick={() => !loading && setAvatar(url)} style={{ width: 60, height: 60, borderRadius: '50%', cursor: loading ? 'default' : 'pointer', border: avatar === url ? '3px solid var(--accent-primary)' : '3px solid transparent', padding: 2, background: 'var(--surface-elevated)' }} />
                ))}
              </div>

              <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                <button className="btn" onClick={handleCancel} disabled={loading}>Cancel</button>
                <button className="btn primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          )}
        </div>

        {/* --- NEW: User Stats Card --- */}
        <div className="card" style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Your Stats</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--space-md)",
              alignItems: "stretch",
            }}
          >
            {/* Level Stat */}
            <div
              style={{
                background: "rgba(59,130,246,0.06)",
                padding: "var(--space-md)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 96,
                border: "1px solid rgba(59,130,246,0.1)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Level</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6, color: "rgba(59,130,246,1)" }}>
                {currentLevel.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>Level {currentLevel.level}</div>
            </div>

            {/* XP Stat */}
            <div
              style={{
                background: "rgba(74,222,128,0.06)",
                padding: "var(--space-md)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 96,
                border: "1px solid rgba(74,222,128,0.1)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total XP</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6, color: "rgba(74,222,128,1)" }}>
                {user?.points?.toLocaleString() || 0}
              </div>
            </div>

            {/* Tokens Stat */}
            <div
              style={{
                background: "rgba(99,102,241,0.06)",
                padding: "var(--space-md)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 96,
                border: "1px solid rgba(99,102,241,0.1)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tokens</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6, color: "rgba(99,102,241,1)" }}>
                🎵 {user?.tokens || 0}
            </div>
            </div>

            {/* Login Streak Stat */}
            <div
              style={{
                background: "rgba(251,146,60,0.06)",
                padding: "var(--space-md)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 96,
                border: "1px solid rgba(251,146,60,0.1)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Login Streak</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6, color: "rgba(251,146,60,1)" }}>
                🔥 {user?.login_streak || 0}
            </div>
            </div>
          </div>
        </div>

        {/* --- NEW: Navigation Links Card --- */}
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>My Activity</h3>
          <p className="small muted">Review your purchases and learning progress.</p>
          <div className="actions" style={{ justifyContent: 'flex-start', marginTop: 'var(--space-md)', gap: 'var(--space-sm)' }}>
            <Link to="/account/order-history" className="btn primary">
              View Order History
            </Link>
            <Link to="/learn/practice-log" className="btn">View Practice Log</Link>
          </div>
        </div>

        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Account Settings</h3>
          <p className="small muted">Manage your login methods and security settings.</p>

          {user?.provider === 'password' &&
            <>
              <div className="actions" style={{ justifyContent: 'flex-start' }}>
                <button className="btn" onClick={() => setShowChangePassword(s => !s)} disabled={loading}>
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-lg)' }} disabled={loading}>
                    <h4>Change Your Password</h4>
                    {passwordError && <div className="alert error">{passwordError}</div>}
                    {passwordSuccess && <div className="alert success">{passwordSuccess}</div>}
                    <div className="field">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                      <div style={{ textAlign: 'right', marginTop: 'var(--space-xs)' }}>
                        <Link to="/forgot-password" className="small link-accent" target="_blank">Forgot password?</Link>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="newPassword">New Password</label>
                      <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                    </div>
                    <div className="field">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn primary" type="submit">{loading ? 'Updating...' : 'Update Password'}</button>
                    </div>
                </form>
              )}
            </>
          }
          <div className="actions" style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn" onClick={logout} disabled={loading}>
              {loading ? 'Logging out...' : 'Logout'}
            </button>
            <button className="btn error" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="card" style={{ maxWidth: 450, margin: '0 auto', background: 'var(--surface-elevated)' }}>
              <h3>Delete Account</h3>
              <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
              <p className="small muted">All of your data, including your profile and cart items, will be removed.</p>
              <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                <button className="btn" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn error" onClick={handleDeleteAccount} disabled={loading}>
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}