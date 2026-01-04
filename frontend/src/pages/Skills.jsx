import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa'
import './Skills.css'

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    axios.get('/api/skills')
      .then(response => {
        setSkills(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching skills:', error)
        setLoading(false)
      })
  }, [])

  const categories = ['all', ...new Set(skills.map(skill => skill.category))]

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory)

  return (
    <div className="skills-page">
      <div className="skills-header">
        <h1>Skill Builder</h1>
        <p>Explore skills to enhance your learning journey</p>
      </div>

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading skills...</div>
      ) : (
        <div className="skills-grid">
          {filteredSkills.map(skill => (
            <div key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-category">{skill.category}</div>
                <FaBookOpen className="skill-icon" />
              </div>
              
              <div className="skill-content">
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
              </div>

              <div className="skill-resources">
                <h4>Learning Resources:</h4>
                <ul>
                  {skill.resources.map((resource, index) => (
                    <li key={index}>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        <FaExternalLinkAlt />
                        {resource.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="btn btn-primary start-learning">
                Start Learning
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Skills