import React from 'react'
import Calendar from '../components/Calendar'
// import './CalendarPage.css'

const CalendarPage = () => {
  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Academic Calendar</h1>
        <p>Schedule your classes, deadlines, and study sessions</p>
      </div>
      <Calendar />
    </div>
  )
}

export default CalendarPage