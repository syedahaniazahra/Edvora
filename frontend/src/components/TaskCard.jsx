import React, { useState } from 'react'
import { FaEdit, FaTrash, FaCheck, FaClock } from 'react-icons/fa'
import './TaskCard.css'

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ ...task })

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    onUpdate(task.id, editData)
    setIsEditing(false)
  }

  const handleStatusToggle = () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    onUpdate(task.id, { status: newStatus })
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#fc8181'
      case 'medium': return '#f6ad55'
      case 'low': return '#68d391'
      default: return '#a0aec0'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isEditing) {
    return (
      <div className="task-card editing">
        <div className="form-group">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="edit-input"
          />
        </div>
        <div className="form-group">
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            className="edit-textarea"
            rows="2"
          />
        </div>
        <div className="edit-actions">
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-actions">
          <button onClick={() => setIsEditing(true)} className="icon-btn">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(task.id)} className="icon-btn delete">
            <FaTrash />
          </button>
        </div>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-details">
        <div className="task-detail">
          <span className="detail-label">Course:</span>
          <span className="detail-value">{task.course}</span>
        </div>
        <div className="task-detail">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{task.type}</span>
        </div>
        <div className="task-detail">
          <span className="detail-label">Deadline:</span>
          <span className="detail-value">{formatDate(task.deadline)}</span>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </div>
        <div className={`task-status ${task.status}`}>
          {task.status === 'completed' ? <FaCheck /> : <FaClock />}
          <span>{task.status}</span>
        </div>
        <button onClick={handleStatusToggle} className="status-toggle">
          Mark as {task.status === 'pending' ? 'Completed' : 'Pending'}
        </button>
      </div>
    </div>
  )
}

export default TaskCard