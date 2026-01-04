import React from 'react'
import PomodoroTimer from '../components/PomodoroTimer'
import './PomodoroPage.css'

const PomodoroPage = () => {
  return (
    <div className="pomodoro-page">
      <div className="page-header">
        <h1>Pomodoro Timer</h1>
        <p>Boost productivity with focused work sessions</p>
      </div>
      <PomodoroTimer />
    </div>
  )
}

export default PomodoroPage