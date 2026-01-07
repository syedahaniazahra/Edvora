// Profile.jsx - Complete Updated Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    deadlineAlerts: true,
    weeklyReports: false,
    promotionalEmails: false,
    mentionNotifications: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditData(parsedUser);
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setDarkMode(true);
          document.documentElement.classList.add('dark-theme');
        }
        
        // Check for saved notification settings
        const savedNotifications = localStorage.getItem('notificationSettings');
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: editData.email,
          phone: editData.phone || '',
          bio: editData.bio || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsEditing(false);
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMessage('Uploading resume...');
    
    // Simulate upload (replace with actual upload endpoint)
    setTimeout(() => {
      setMessage('Resume uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1500);
  };

  const handleChangePassword = () => {
    const oldPassword = prompt('Enter current password:');
    if (!oldPassword) return;
    
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Confirm new password:');
    if (!confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    
    // Simulate password change (replace with actual API call)
    setMessage('Password changed successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      userInfo: user,
      notificationSettings: notificationSettings,
      themePreference: darkMode ? 'dark' : 'light',
      exportDate: new Date().toISOString(),
      note: 'Your data export from Edvora'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `edvora-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage('Data exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleNotification = (setting) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  if (loading) {
    return (
      <div className="profile-loading" style={{ paddingTop: '80px' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container" style={{ paddingTop: '80px' }}>
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <h1>My Profile</h1>
          <p className="subtitle">Manage your account settings</p>
        </div>
        <div className="header-right">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="profile-content">
        {/* Left Column - Profile Info */}
        <div className="profile-card">
          <div className="profile-header-section">
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p className="profile-role">{user.role || 'Student'}</p>
              <p className="profile-email">{user.email}</p>
              {user.studentId && (
                <p className="profile-studentid">ID: {user.studentId}</p>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={editData.bio || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email || 'Not set'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{user.phone || 'Not set'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{user.department || 'Computer Science'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>About</h3>
                <div className="bio">
                  {user.bio || 'No bio yet. Click Edit Profile to add one.'}
                </div>
              </div>

              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Settings */}
        <div className="actions-card">
          <h3>Account Actions</h3>
          
          <div className="action-buttons">
            <label className="action-btn upload-btn">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleUploadResume}
                style={{ display: 'none' }}
              />
              <span className="action-icon">📄</span>
              Upload Resume/CV
            </label>

            <button className="action-btn" onClick={handleChangePassword}>
              <span className="action-icon">🔒</span>
              Change Password
            </button>

            <button className="action-btn" onClick={handleExportData}>
              <span className="action-icon">📤</span>
              Export My Data
            </button>

            <button className="action-btn" onClick={() => alert('Notification settings panel is already visible below')}>
              <span className="action-icon">🔔</span>
              Notification Settings
            </button>

            <button className="action-btn" onClick={toggleTheme}>
              <span className="action-icon">{darkMode ? '☀️' : '🌙'}</span>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button 
              className="action-btn danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  alert('Account deletion feature would be implemented here');
                }
              }}
            >
              <span className="action-icon">🗑️</span>
              Delete Account
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="theme-switch">
            <div className="theme-label">
              <span className="theme-icon">{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Light' : 'Dark'} Mode
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Notification Settings */}
          <div className="notification-settings">
            <h3>Notification Settings</h3>
            
            <div className="notification-item">
              <div className="notification-label">
                <span className="notification-icon">📧</span>
                <div>
                  <div className="notification-text">Email Notifications</div>
                  <div className="notification-description">Receive email updates</div>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.emailNotifications}
                  onChange={() => toggleNotification('emailNotifications')}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-label">
                <span className="notification-icon">⏰</span>
                <div>
                  <div className="notification-text">Task Reminders</div>
                  <div className="notification-description">Reminders for upcoming tasks</div>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.taskReminders}
                  onChange={() => toggleNotification('taskReminders')}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-label">
                <span className="notification-icon">⚠️</span>
                <div>
                  <div className="notification-text">Deadline Alerts</div>
                  <div className="notification-description">Alerts for approaching deadlines</div>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.deadlineAlerts}
                  onChange={() => toggleNotification('deadlineAlerts')}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-label">
                <span className="notification-icon">📊</span>
                <div>
                  <div className="notification-text">Weekly Reports</div>
                  <div className="notification-description">Weekly progress reports</div>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.weeklyReports}
                  onChange={() => toggleNotification('weeklyReports')}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-label">
                <span className="notification-icon">🔔</span>
                <div>
                  <div className="notification-text">Mention Notifications</div>
                  <div className="notification-description">When someone mentions you</div>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.mentionNotifications}
                  onChange={() => toggleNotification('mentionNotifications')}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="stats-section">
            <h3>Account Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Tasks Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Days Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
          </div>

          <div className="account-info">
            <h3>Account Information</h3>
            <div className="info-item">
              <span>Member since:</span>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
            <div className="info-item">
              <span>Account type:</span>
              <span className="account-type">{user.role || 'Student'}</span>
            </div>
            <div className="info-item">
              <span>Status:</span>
              <span className="status-active">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;