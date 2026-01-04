import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import './Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'class',
    color: '#667eea'
  })

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = () => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    axios.get(`/api/calendar/events/date/${year}-${month}`)
      .then(response => {
        setEvents(response.data)
      })
      .catch(error => console.error('Error fetching events:', error))
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    return {
      firstDay,
      lastDay,
      daysInMonth
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleEventSubmit = (e) => {
    e.preventDefault()
    
    if (selectedEvent) {
      // Update event
      axios.put(`/api/calendar/events/${selectedEvent.id}`, eventForm)
        .then(() => {
          fetchEvents()
          resetForm()
        })
        .catch(error => console.error('Error updating event:', error))
    } else {
      // Create new event
      axios.post('/api/calendar/events', eventForm)
        .then(() => {
          fetchEvents()
          resetForm()
        })
        .catch(error => console.error('Error creating event:', error))
    }
  }

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      axios.delete(`/api/calendar/events/${eventId}`)
        .then(() => {
          fetchEvents()
        })
        .catch(error => console.error('Error deleting event:', error))
    }
  }

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'class',
      color: '#667eea'
    })
    setSelectedEvent(null)
    setShowEventForm(false)
  }

  const editEvent = (event) => {
    setSelectedEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      color: event.color
    })
    setShowEventForm(true)
  }

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date.startsWith(dateStr))
  }

  const { daysInMonth } = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={prevMonth} className="nav-btn">
            <FaChevronLeft />
          </button>
          <h2>{monthYear}</h2>
          <button onClick={nextMonth} className="nav-btn">
            <FaChevronRight />
          </button>
        </div>
        <button 
          onClick={() => setShowEventForm(!showEventForm)} 
          className="btn btn-primary"
        >
          <FaPlus /> Add Event
        </button>
      </div>

      {showEventForm && (
        <div className="event-form">
          <h3>{selectedEvent ? 'Edit Event' : 'Add New Event'}</h3>
          <form onSubmit={handleEventSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
              >
                <option value="class">Class</option>
                <option value="meeting">Meeting</option>
                <option value="study">Study Session</option>
                <option value="exam">Exam</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Event details"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedEvent ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map(day => {
            const dayEvents = getEventsForDay(day)
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()
            
            return (
              <div 
                key={day} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{day}</div>
                <div className="day-events">
                  {dayEvents.slice(0, 2).map(event => (
                    <div 
                      key={event.id} 
                      className="event-dot"
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} (${event.startTime})`}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="more-events">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="events-list">
        <h3>Upcoming Events</h3>
        {events.length === 0 ? (
          <p className="no-events">No events scheduled</p>
        ) : (
          events.slice(0, 5).map(event => (
            <div key={event.id} className="event-item">
              <div className="event-color" style={{ backgroundColor: event.color }}></div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <span className="event-time">
                  {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="event-actions">
                <button onClick={() => editEvent(event)} className="icon-btn">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteEvent(event.id)} className="icon-btn delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Calendar