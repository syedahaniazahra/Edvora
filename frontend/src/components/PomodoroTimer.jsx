import React, { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaStop, FaRedo, FaChartBar, FaCoffee } from 'react-icons/fa'
import axios from 'axios'
import './PomodoroTimer.css'

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work' or 'break'
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [taskName, setTaskName] = useState('')
  const timerRef = useRef(null)
  
  const workTime = 25 * 60 // 25 minutes
  const shortBreakTime = 5 * 60 // 5 minutes
  const longBreakTime = 15 * 60 // 15 minutes

  useEffect(() => {
    fetchStats()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      handleTimerComplete()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, time])

  const fetchStats = () => {
    axios.get('/api/pomodoro/stats')
      .then(response => {
        setStats(response.data)
      })
      .catch(error => console.error('Error fetching stats:', error))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const stopTimer = () => {
    setIsActive(false)
    if (mode === 'work') {
      setTime(workTime)
    } else {
      setTime(mode === 'shortBreak' ? shortBreakTime : longBreakTime)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'work') {
      setTime(workTime)
    } else {
      setTime(mode === 'shortBreak' ? shortBreakTime : longBreakTime)
    }
  }

  const switchMode = (newMode) => {
    setIsActive(false)
    setMode(newMode)
    if (newMode === 'work') {
      setTime(workTime)
    } else if (newMode === 'shortBreak') {
      setTime(shortBreakTime)
    } else {
      setTime(longBreakTime)
    }
  }

  const handleTimerComplete = () => {
    setIsActive(false)
    
    // Play notification sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3')
    audio.play()
    
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work' ? 'Time for a break! ☕' : 'Break is over! Back to work! 💪',
        icon: '/favicon.ico'
      })
    }

    // Save session if work mode completed
    if (mode === 'work') {
      saveSession()
      
      // Switch to break mode
      const completedSessions = sessions.filter(s => s.completed).length + 1
      const nextMode = completedSessions % 4 === 0 ? 'longBreak' : 'shortBreak'
      setTimeout(() => {
        setMode(nextMode)
        setTime(nextMode === 'shortBreak' ? shortBreakTime : longBreakTime)
      }, 1000)
    } else {
      // Switch back to work mode
      setTimeout(() => {
        setMode('work')
        setTime(workTime)
      }, 1000)
    }
  }

  const saveSession = () => {
    const session = {
      duration: 25, // 25 minutes
      taskName: taskName || 'Focus Session',
      completedAt: new Date().toISOString()
    }

    axios.post('/api/pomodoro/sessions', session)
      .then(response => {
        setSessions([...sessions, response.data])
        fetchStats()
        setTaskName('')
      })
      .catch(error => console.error('Error saving session:', error))
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <h2>Pomodoro Timer</h2>
        <p>Focus for 25 minutes, then take a break</p>
      </div>

      <div className="pomodoro-main">
        <div className="timer-display">
          <div className="timer-circle">
            <div className="timer-text">
              <span className="timer-time">{formatTime(time)}</span>
              <span className="timer-mode">
                {mode === 'work' ? 'Focus Time' : 
                 mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </span>
            </div>
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle 
                className="timer-background" 
                cx="50" cy="50" r="45" 
              />
              <circle 
                className="timer-progress" 
                cx="50" cy="50" r="45"
                style={{
                  strokeDasharray: 283,
                  strokeDashoffset: 283 - (283 * (time / (mode === 'work' ? workTime : mode === 'shortBreak' ? shortBreakTime : longBreakTime)))
                }}
              />
            </svg>
          </div>

          <div className="timer-controls">
            {!isActive ? (
              <button onClick={startTimer} className="btn btn-primary control-btn">
                <FaPlay /> Start
              </button>
            ) : (
              <button onClick={pauseTimer} className="btn btn-secondary control-btn">
                <FaPause /> Pause
              </button>
            )}
            <button onClick={stopTimer} className="btn btn-secondary control-btn">
              <FaStop /> Stop
            </button>
            <button onClick={resetTimer} className="btn btn-secondary control-btn">
              <FaRedo /> Reset
            </button>
          </div>

          <div className="task-input">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What are you working on?"
              className="task-field"
            />
          </div>
        </div>

        <div className="mode-selector">
          <button 
            onClick={() => switchMode('work')} 
            className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
          >
            <span className="mode-icon">💼</span>
            <span className="mode-label">Work</span>
            <span className="mode-duration">25:00</span>
          </button>
          <button 
            onClick={() => switchMode('shortBreak')} 
            className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
          >
            <span className="mode-icon">☕</span>
            <span className="mode-label">Short Break</span>
            <span className="mode-duration">05:00</span>
          </button>
          <button 
            onClick={() => switchMode('longBreak')} 
            className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
          >
            <span className="mode-icon">🌴</span>
            <span className="mode-label">Long Break</span>
            <span className="mode-duration">15:00</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className="pomodoro-stats">
          <h3><FaChartBar /> Today's Stats</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-number">{stats.todaySessions || 0}</span>
              <span className="stat-label">Sessions Today</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.totalFocusTime || 0}</span>
              <span className="stat-label">Total Focus (min)</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.totalSessions || 0}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.averageSessionsPerDay || 0}</span>
              <span className="stat-label">Avg/Day (7d)</span>
            </div>
          </div>
        </div>
      )}

      <div className="pomodoro-tips">
        <h3><FaCoffee /> Pomodoro Technique Tips</h3>
        <ul className="tips-list">
          <li>Choose a task to work on</li>
          <li>Set timer for 25 minutes</li>
          <li>Work on task until timer rings</li>
          <li>Take a short break (5 minutes)</li>
          <li>After 4 sessions, take a longer break (15-30 minutes)</li>
        </ul>
      </div>
    </div>
  )
}

export default PomodoroTimer