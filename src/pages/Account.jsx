<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
=======
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
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

<<<<<<< HEAD
// --- UPDATED HELPER COMPONENT: Use user.profile_completed ---
function ProfileProgressBar({ percentage }) {
  return (
    <div style={{ marginTop: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
        <span className="small">Profile Completion</span>
        <span className="small" style={{ fontWeight: 'bold' }}>{percentage}%</span>
      </div>
      <div style={{
        height: '8px',
        background: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: 'var(--success)',
          transition: 'width 0.3s ease-out'
        }} />
      </div>
    </div>
  )
}

// --- UPDATED HELPER COMPONENT: Handle null values ---
function ProfileDetail({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 'var(--space-sm)' }}>
      <span className="small muted">{label}</span>
      <span className="small">{value}</span>
    </div>
  )
}


export default function Account(){
  const { user, logout, updateProfile, changePassword, deleteAccount, loading } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [error, setError] = useState('')

  // --- UPDATED: Edit profile form state ---
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar_url || '')
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [addressLine1, setAddressLine1] = useState(user?.address_line1 || '')
  const [city, setCity] = useState(user?.city || '')
  const [zipCode, setZipCode] = useState(user?.zip_code || '')
  const [country, setCountry] = useState(user?.country || '')
  // --- END UPDATED STATE ---
=======
export default function Account(){
  const { user, updateProfile, changePassword, deleteAccount, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  // Edit profile form state
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar_url || '')
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

<<<<<<< HEAD
  // keep local form state in sync with backend user whenever user object changes
useEffect(() => {
  if (!user) return;

  setName(user.name || '');
  setAvatar(user.avatar_url || '');
  setFirstName(user.first_name || '');
  setLastName(user.last_name || '');
  setPhone(user.phone || '');
  setAddressLine1(user.address_line1 || '');
  setCity(user.city || '');
  setZipCode(user.zip_code || '');
  setCountry(user.country || '');
}, [user]);

  // --- REMOVED: Local useMemo calculation -- now use user.profile_completed from backend ---

  // --- UPDATED: Handle Edit ---
  const handleEdit = () => {
    setName(user.name || '')
    setAvatar(user.avatar_url || '')
    setFirstName(user.first_name || '')
    setLastName(user.last_name || '')
    setPhone(user.phone || '')
    setAddressLine1(user.address_line1 || '')
    setCity(user.city || '')
    setZipCode(user.zip_code || '')
    setCountry(user.country || '')
    
    setIsEditing(true)
    setError('')
  }
  // --- END UPDATED HANDLE EDIT ---
=======
  const handleEdit = () => {
    setName(user.name)
    setAvatar(user.avatar_url)
    setIsEditing(true)
    setError('')
  }
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

<<<<<<< HEAD
  // --- UPDATED: Handle Save ---
  const handleSave = async () => {
    setError('')
    const dataToUpdate = {}
    
    // Check all fields for changes
    if (name !== user.name) dataToUpdate.name = name
    if (avatar !== user.avatar_url) dataToUpdate.avatar_url = avatar
    if (firstName !== (user.first_name || '')) dataToUpdate.first_name = firstName
    if (lastName !== (user.last_name || '')) dataToUpdate.last_name = lastName
    if (phone !== (user.phone || '')) dataToUpdate.phone = phone
    if (addressLine1 !== (user.address_line1 || '')) dataToUpdate.address_line1 = addressLine1
    if (city !== (user.city || '')) dataToUpdate.city = city
    if (zipCode !== (user.zip_code || '')) dataToUpdate.zip_code = zipCode
    if (country !== (user.country || '')) dataToUpdate.country = country
=======
  const handleSave = async () => {
    setError('')
    const dataToUpdate = {}
    if (name !== user.name) dataToUpdate.name = name
    if (avatar !== user.avatar_url) dataToUpdate.avatar_url = avatar
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

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
<<<<<<< HEAD
  // --- END UPDATED HANDLE SAVE ---
=======
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

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

<<<<<<< HEAD
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // --- UPDATED: Use backend value, fallback to 0 ---
  const profileCompletion = user?.profile_completed ?? 0
  // --- END UPDATED ---

=======
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
  return (
    <section>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2>Your Account</h2>

        {error && <div className="alert error">{error}</div>}

        <div className="card">
<<<<<<< HEAD
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
=======
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
            <img src={isEditing ? avatar : user?.avatar_url} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', background: 'var(--surface-elevated)' }} />
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div className="field">
<<<<<<< HEAD
                  <label htmlFor="name">Display Name</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} placeholder="e.g. MusicMan99" />
=======
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
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

<<<<<<< HEAD
          {/* --- UPDATED: Show completion bar or edit form --- */}
          {isEditing ? (
            // EDITING MODE
            <div style={{ borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-lg)' }}>
              <h4>Edit Contact & Address</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', margin: 'var(--space-md) 0' }}>
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
              <div className="field">
                <label htmlFor="addressLine1">Address</label>
                <input id="addressLine1" type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} disabled={loading} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} disabled={loading} />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">Zip / Postal Code</label>
                  <input id="zipCode" type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} disabled={loading} />
                </div>
                <div className="field">
                  <label htmlFor="country">Country</label>
                  <input id="country" type="text" value={country} onChange={e => setCountry(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <label>Choose Avatar</label>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                  {avatarOptions.map(url => (
                    <img key={url} src={url} alt="avatar option" onClick={() => !loading && setAvatar(url)} style={{ width: 60, height: 60, borderRadius: '50%', cursor: loading ? 'default' : 'pointer', border: avatar === url ? '3px solid var(--accent-primary)' : '3px solid transparent', padding: 2, background: 'var(--surface-elevated)' }} />
                  ))}
                </div>
              </div>

=======
          {isEditing && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <label>Choose Avatar</label>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                {avatarOptions.map(url => (
                  <img key={url} src={url} alt="avatar option" onClick={() => !loading && setAvatar(url)} style={{ width: 60, height: 60, borderRadius: '50%', cursor: loading ? 'default' : 'pointer', border: avatar === url ? '3px solid var(--accent-primary)' : '3px solid transparent', padding: 2, background: 'var(--surface-elevated)' }} />
                ))}
              </div>
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
              <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                <button className="btn" onClick={handleCancel} disabled={loading}>Cancel</button>
                <button className="btn primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
<<<<<<< HEAD
          ) : (
            // VIEW MODE
            <div style={{ borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-lg)' }}>
              <ProfileProgressBar percentage={profileCompletion} />
              
              <div style={{ marginTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <ProfileDetail label="Full Name" value={user?.first_name || user?.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : null} />
                <ProfileDetail label="Email" value={user?.email} />
                <ProfileDetail label="Phone" value={user?.phone} />
                <ProfileDetail label="Address" value={
                  (user?.address_line1 || user?.city) ? 
                  `${user.address_line1 || ''}, ${user.city || ''} ${user.zip_code || ''}, ${user.country || ''}`.replace(/ ,/g,',').replace(/, ,/g,',').trim().replace(/^,|,$/g,'')
                  : null
                } />
              </div>
            </div>
          )}
          {/* --- END UPDATED SECTION --- */}
        </div>


        {/* Order History Card */}
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Order History</h3>
          <p className="small muted">View all your past orders and purchase history.</p>
          <div className="actions" style={{ justifyContent: 'flex-start', marginTop: 'var(--space-md)' }}>
            <button className="btn primary" onClick={() => navigate('/account/order-history')}>
              View Order History
            </button>
          </div>
        </div>

        {/* Account Settings Card */}
=======
          )}
        </div>

>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
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
<<<<<<< HEAD
            <button className="btn" onClick={() => setShowLogoutConfirm(true)} disabled={loading}>Logout</button>
            <button className="btn error" onClick={() => setShowDeleteConfirm(true)} style={{ marginLeft: 'auto' }}>Delete Account</button>
          </div>
        </div>

        {/* Modals remain the same */}
        {showDeleteConfirm && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)' }}>
=======
            <button className="btn error" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="modal-overlay">
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
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
<<<<<<< HEAD

        {showLogoutConfirm && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ maxWidth: 450, margin: '0 auto', background: 'var(--surface-elevated)' }}>
              <h3>Logout</h3>
              <p>Are you sure you want to log out?</p>
              <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                <button className="btn" onClick={() => setShowLogoutConfirm(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn error" onClick={handleLogout} disabled={loading}>
                  {loading ? 'Logging out...' : 'Yes, Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
=======
      </div>
    </section>
  )
}
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
