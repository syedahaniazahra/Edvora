import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaUserGraduate } from 'react-icons/fa'
import { useAuth } from '../App'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@edvora.com',
      password: 'demo123'
    })
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card fade-in">
          <div className="login-header">
            <div className="login-icon">
              <FaUserGraduate />
            </div>
            <h1>Welcome Back!</h1>
            <p>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock className="input-icon" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-control"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="demo-login">
              <button 
                type="button" 
                className="demo-btn"
                onClick={handleDemoLogin}
              >
                Use Demo Account
              </button>
            </div>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <FaGoogle />
                Google
              </button>
              <button type="button" className="social-btn github">
                <FaGithub />
                GitHub
              </button>
            </div>

            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="register-link">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="login-features">
          <div className="feature-card">
            <h3>Why Edvora?</h3>
            <ul className="features-list">
              <li>📅 Smart Academic Planner</li>
              <li>📚 Curated Learning Resources</li>
              <li>⚡ Skill Development Tools</li>
              <li>🔔 Deadline Reminders</li>
              <li>💡 Motivational Support</li>
              <li>🎯 Progress Tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login