// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          navigate('/login');
          return;
        }

        // Parse user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch dashboard data
        await fetchDashboardData(token);
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats || statsData);
        }
      }

      // Fetch tasks
      const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.success) {
          const tasks = tasksData.tasks || tasksData;
          // Get recent tasks (limit to 5)
          const recent = Array.isArray(tasks) 
            ? tasks.slice(0, 5).map(task => ({
                id: task._id || task.id,
                title: task.title,
                description: task.description,
                course: task.course,
                deadline: task.deadline,
                status: task.status,
                priority: task.priority
              }))
            : [];
          setRecentTasks(recent);
        }
      }

      // Fetch motivational quote
      const quoteResponse = await fetch('http://localhost:5000/api/quote');
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        setQuote(quoteData.quote || quoteData.message || 'Stay focused and keep learning!');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      // Set mock data for development
      setMockData();
    }
  };

  const setMockData = () => {
    setStats({
      totalTasks: 12,
      completedTasks: 8,
      pendingTasks: 4,
      completionRate: 67
    });

    setRecentTasks([
      {
        id: 1,
        title: 'Complete React Project',
        description: 'Finish the Edvora dashboard',
        course: 'Web Development',
        deadline: '2024-01-20',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Study for Exam',
        description: 'Prepare for midterm exams',
        course: 'Computer Science',
        deadline: '2024-01-22',
        status: 'in-progress',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Update Resume',
        description: 'Add recent projects and skills',
        course: 'Career',
        deadline: '2024-01-25',
        status: 'pending',
        priority: 'low'
      }
    ]);

    setQuote('The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user?.name || 'Student'}!</h1>
          <p className="subtitle">Here's your study overview</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-role">{user?.department || 'Computer Science'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-tasks">📋</div>
          <div className="stat-info">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-info">
            <h3>{stats.completedTasks}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingTasks}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rate">📈</div>
          <div className="stat-info">
            <h3>{stats.completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column - Recent Tasks */}
        <div className="content-left">
          <div className="section-header">
            <h2>Recent Tasks</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/tasks')}
            >
              View All →
            </button>
          </div>
          
          <div className="tasks-list">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-main">
                    <h4>{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className="task-course">{task.course || 'General'}</span>
                      <span className={`task-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="task-side">
                    <div className="task-deadline">
                      Due: {formatDate(task.deadline)}
                    </div>
                    <span className={`task-status ${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tasks">
                <p>No tasks yet. Start by adding your first task!</p>
                <button 
                  className="add-first-task"
                  onClick={() => navigate('/tasks')}
                >
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Links & Motivation */}
        <div className="content-right">
          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => navigate('/tasks')}
              >
                <span className="action-icon">➕</span>
                Add New Task
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/calendar')}
              >
                <span className="action-icon">📅</span>
                View Calendar
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/resources')}
              >
                <span className="action-icon">📚</span>
                Study Resources
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/profile')}
              >
                <span className="action-icon">👤</span>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="motivation-card">
            <h2>Daily Motivation</h2>
            <div className="quote">
              "{quote}"
            </div>
            <button 
              className="refresh-quote"
              onClick={() => {
                fetch('http://localhost:5000/api/quote')
                  .then(res => res.json())
                  .then(data => setQuote(data.quote || data.message))
                  .catch(() => setQuote('Stay focused and keep learning!'));
              }}
            >
              Refresh Quote 🔄
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="deadlines-card">
            <h2>Upcoming Deadlines</h2>
            {recentTasks.filter(task => task.deadline).length > 0 ? (
              <ul className="deadlines-list">
                {recentTasks
                  .filter(task => task.deadline && task.status !== 'completed')
                  .slice(0, 3)
                  .map(task => (
                    <li key={task.id} className="deadline-item">
                      <span className="deadline-title">{task.title}</span>
                      <span className="deadline-date">{formatDate(task.deadline)}</span>
                    </li>
                  ))
                }
              </ul>
            ) : (
              <p className="no-deadlines">No upcoming deadlines 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;