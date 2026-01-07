import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Science'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // Use relative path — axios.baseURL will prefix it from env or fallback
      const response = await axios.post('/api/auth/register', formData)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Navigate to dashboard immediately after success
      navigate('/dashboard')
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>
          <p>Join Edvora and start your learning journey</p>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* FIXED: Distinct Username Field */}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>
            
            {/* FIXED: distinct Email Field */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter your student ID"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register