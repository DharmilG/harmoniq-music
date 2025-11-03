import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/logo.png'
<<<<<<< HEAD
=======

>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
export default function Navbar(){
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLoginClick = () => navigate('/login')
<<<<<<< HEAD
=======
  const handleLogout = () => { logout(); navigate('/') }
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
  const handleAccount = () => navigate('/account')

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <div className="logo"><img src={logo} alt="logo" /></div>
          <span>Harmoniq</span>
        </div>
        <div className="menu">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/lessons">Lessons</NavLink>
          <NavLink to="/store">Store</NavLink>
          <NavLink to="/partnerships">Partnerships</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact" >Contact</NavLink>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isAuthenticated ? (
              <button className="cta" onClick={handleLoginClick}>Login</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="cta" onClick={handleAccount} title={user?.email}>
                  <img
                    src={user?.avatar_url}
                    alt="avatar"
                    style={{
                      width: 32, height: 32, borderRadius: '50%', verticalAlign: 'middle',
                      marginRight: 8, objectFit: 'cover', background: 'var(--surface-elevated)',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  {user?.name?.split(' ')[0] || 'Account'}
                </button>
<<<<<<< HEAD
=======
                <button className="cta" onClick={handleLogout}>Logout</button>
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
