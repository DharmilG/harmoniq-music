import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const location = useLocation()

  useEffect(() => {
    // Start exit animation
    setIsVisible(false)
    
    // After exit animation, update content and start enter animation
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsVisible(true)
    }, 150) // Half of transition duration

    return () => clearTimeout(timer)
  }, [location.pathname, children])

  useEffect(() => {
    // Initial mount
    setIsVisible(true)
  }, [])

  return (
    <div 
      className={`page-transition ${isVisible ? 'visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {displayChildren}
    </div>
  )
}