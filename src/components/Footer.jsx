import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer(){
  return (
    <footer>
      <div className="container">
        <div className="cols">
          <div>
            <div className="brand"><div className="logo"><img src={logo} alt="logo" /></div><span>Harmoniq</span></div>
            <p className="small">Modern music education and instruments.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul className="small">
              <li><Link to="/lessons">Lessons</Link></li>
              <li><Link to="/store">Store</Link></li>
              <li><Link to="/partnerships">Partnerships</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p className="small">hello@harmoniq.example • +1 (555) 010-2025</p>
          </div>
        </div>
        <p className="small">© {new Date().getFullYear()} Harmoniq Music Academy — In partnership with Red Bull and Yamaha.</p>
      </div>
    </footer>
  )
}

