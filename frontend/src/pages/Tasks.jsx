// Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    type: 'assignment',
    priority: 'medium',
    deadline: '',
    tags: ''
  });

  // Check authentication and fetch tasks
  useEffect(() => {
    const checkAuthAndFetchTasks = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/login');
        return;
      }

      try {
        await fetchTasks();
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchTasks();
  }, [navigate]);

  // Filter and sort tasks whenever tasks, filter, or sortBy changes
  useEffect(() => {
    let result = [...tasks];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(task => 
        filter === 'completed' ? task.completed || task.status === 'completed' :
        filter === 'pending' ? !task.completed && task.status !== 'completed' :
        task.priority === filter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
        case 'priority':
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
  }, [tasks, filter, sortBy]);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    const tasksData = data.tasks || data;
    setTasks(Array.isArray(tasksData) ? tasksData : []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask.task || newTask]);
        resetForm();
        setShowAddForm(false);
      } else {
        throw new Error('Failed to add task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    if (!editingTask) return;
    
    const token = localStorage.getItem('token');
    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      status: formData.status || 'pending'
    };

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingTask.id || editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id || task._id === editingTask._id 
            ? (updatedTask.task || updatedTask) 
            : task
        ));
        resetForm();
        setEditingTask(null);
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => 
          task.id !== taskId && task._id !== taskId
        ));
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (task) => {
    const token = localStorage.getItem('token');
    const updatedTask = {
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
      completed: !task.completed
    };

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id || task._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(t => 
          t.id === task.id || t._id === task._id 
            ? (result.task || result) 
            : t
        ));
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      course: task.course || '',
      type: task.type || 'assignment',
      priority: task.priority || 'medium',
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      status: task.status || 'pending'
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course: '',
      type: 'assignment',
      priority: 'medium',
      deadline: '',
      tags: ''
    });
    setEditingTask(null);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="tasks-loading">
        <div className="spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      {/* Header */}
      <header className="tasks-header">
        <div className="header-left">
          <h1>My Tasks</h1>
          <p className="subtitle">Manage your assignments and deadlines</p>
        </div>
        <div className="header-right">
          <button 
            className="add-task-btn"
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add New Task'}
          </button>
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Add/Edit Task Form */}
      {showAddForm && (
        <div className="task-form-container">
          <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Task title"
                />
              </div>

              <div className="form-group">
                <label>Course/Subject</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science 101"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>

              {editingTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Task description..."
                />
              </div>

              <div className="form-group full-width">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., programming, math, urgent"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="controls">
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({tasks.filter(t => !t.completed && t.status !== 'completed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.filter(t => t.completed || t.status === 'completed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Priority ({tasks.filter(t => t.priority === 'high').length})
          </button>
        </div>

        <div className="sort">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="created">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found. {filter !== 'all' && 'Try changing your filter.'}</p>
            {filter === 'all' && (
              <button 
                className="add-first-task"
                onClick={() => setShowAddForm(true)}
              >
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id || task._id} className="task-card">
              <div className="task-header">
                <div className="task-title-section">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed || task.status === 'completed'}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </div>
                  <div>
                    <h3 className={task.completed || task.status === 'completed' ? 'completed' : ''}>
                      {task.title}
                    </h3>
                    {task.course && (
                      <span className="task-course">{task.course}</span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEditTask(task)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id || task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-details">
                <div className="task-tags">
                  {Array.isArray(task.tags) && task.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="task-meta">
                  <span className="task-type">{task.type}</span>
                  <span 
                    className="task-priority"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority} priority
                  </span>
                  <span className="task-deadline">
                    {task.deadline ? `Due: ${formatDate(task.deadline)}` : 'No deadline'}
                  </span>
                  <span className={`task-status ${task.status}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {tasks.filter(t => !t.completed && t.status !== 'completed').length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {tasks.filter(t => t.priority === 'high').length}
          </span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {tasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length}
          </span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>
    </div>
  );
};

export default Tasks;