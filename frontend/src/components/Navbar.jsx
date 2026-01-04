import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaHome, 
  FaTasks, 
  FaBook, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaGraduationCap
} from 'react-icons/fa'
import { useAuth } from '../App'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={() => setIsMenuOpen(false)}>
            <span className="brand-logo">🎓</span>
            <div className="brand-text">
              <span className="brand-name">Edvora</span>
              <span className="brand-tagline">Student Platform</span>
            </div>
          </Link>
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaHome />
                <span>Dashboard</span>
              </Link>
              
              <Link to="/tasks" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaTasks />
                <span>Tasks</span>
              </Link>
              
              <Link to="/calendar" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaCalendarAlt />
                <span>Calendar</span>
              </Link>
              
              <Link to="/pomodoro" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaClock />
                <span>Pomodoro</span>
              </Link>
              
              <Link to="/resources" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaBook />
                <span>Resources</span>
              </Link>
              
              <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaUser />
                <span>Profile</span>
              </Link>

              <div className="nav-user">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff`} 
                  alt={user.name}
                  className="user-avatar"
                />
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link btn-primary" onClick={() => setIsMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar