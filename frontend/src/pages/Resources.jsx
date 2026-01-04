// Resources.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Resources.css';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const sampleResources = [
    {
      id: 1,
      title: 'React Documentation',
      description: 'Official React documentation with tutorials and API reference',
      type: 'documentation',
      category: 'Frontend',
      url: 'https://reactjs.org',
      tags: ['react', 'javascript', 'frontend'],
      recommended: true
    },
    {
      id: 2,
      title: 'Node.js Best Practices',
      description: 'Comprehensive guide to Node.js development best practices',
      type: 'guide',
      category: 'Backend',
      url: 'https://github.com/goldbergyoni/nodebestpractices',
      tags: ['nodejs', 'backend', 'best-practices'],
      recommended: true
    },
    {
      id: 3,
      title: 'MongoDB University',
      description: 'Free courses and certifications for MongoDB',
      type: 'course',
      category: 'Database',
      url: 'https://university.mongodb.com',
      tags: ['mongodb', 'database', 'courses'],
      recommended: true
    },
    {
      id: 4,
      title: 'JavaScript.info',
      description: 'Modern JavaScript tutorial from basics to advanced topics',
      type: 'tutorial',
      category: 'Frontend',
      url: 'https://javascript.info',
      tags: ['javascript', 'tutorial', 'web'],
      recommended: false
    },
    {
      id: 5,
      title: 'CSS Tricks',
      description: 'Tips, tricks, and techniques for using CSS',
      type: 'blog',
      category: 'Frontend',
      url: 'https://css-tricks.com',
      tags: ['css', 'web-design', 'tutorials'],
      recommended: false
    },
    {
      id: 6,
      title: 'FreeCodeCamp',
      description: 'Free coding courses and certifications',
      type: 'course',
      category: 'Full Stack',
      url: 'https://www.freecodecamp.org',
      tags: ['courses', 'free', 'certification'],
      recommended: true
    },
    {
      id: 7,
      title: 'Stack Overflow',
      description: 'Q&A community for programmers',
      type: 'community',
      category: 'General',
      url: 'https://stackoverflow.com',
      tags: ['q&a', 'community', 'help'],
      recommended: false
    },
    {
      id: 8,
      title: 'GitHub Learning Lab',
      description: 'Learn Git and GitHub through interactive courses',
      type: 'course',
      category: 'Tools',
      url: 'https://lab.github.com',
      tags: ['git', 'github', 'version-control'],
      recommended: true
    }
  ];

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
        // For now, use sample resources
        setResources(sampleResources);
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const filteredResources = resources.filter(resource => {
    // Apply category filter
    if (filter !== 'all' && resource.category.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        resource.category.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleResourceClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveResource = (resourceId) => {
    const saved = JSON.parse(localStorage.getItem('savedResources') || '[]');
    if (!saved.includes(resourceId)) {
      saved.push(resourceId);
      localStorage.setItem('savedResources', JSON.stringify(saved));
      alert('Resource saved to your collection!');
    } else {
      alert('Resource already saved!');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return '🎓';
      case 'tutorial': return '📖';
      case 'documentation': return '📚';
      case 'guide': return '🗺️';
      case 'blog': return '✍️';
      case 'community': return '👥';
      default: return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="resources-loading">
        <div className="spinner"></div>
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* Header */}
      <header className="resources-header">
        <div className="header-left">
          <h1>Study Resources</h1>
          <p className="subtitle">Curated learning materials for your journey</p>
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

      {/* Search and Filter */}
      <div className="resources-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'frontend' ? 'active' : ''}`}
            onClick={() => setFilter('frontend')}
          >
            Frontend
          </button>
          <button 
            className={`filter-btn ${filter === 'backend' ? 'active' : ''}`}
            onClick={() => setFilter('backend')}
          >
            Backend
          </button>
          <button 
            className={`filter-btn ${filter === 'database' ? 'active' : ''}`}
            onClick={() => setFilter('database')}
          >
            Database
          </button>
          <button 
            className={`filter-btn ${filter === 'tools' ? 'active' : ''}`}
            onClick={() => setFilter('tools')}
          >
            Tools
          </button>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="recommended-section">
        <h2>Recommended for You</h2>
        <div className="recommended-grid">
          {filteredResources
            .filter(r => r.recommended)
            .map(resource => (
              <div key={resource.id} className="resource-card recommended">
                <div className="resource-header">
                  <span className="resource-type">{getTypeIcon(resource.type)} {resource.type}</span>
                  {resource.recommended && <span className="recommended-badge">⭐ Recommended</span>}
                </div>
                <h3>{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-tags">
                  {resource.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="resource-category">{resource.category}</div>
                <div className="resource-actions">
                  <button 
                    className="visit-btn"
                    onClick={() => handleResourceClick(resource.url)}
                  >
                    Visit Resource
                  </button>
                  <button 
                    className="save-btn"
                    onClick={() => handleSaveResource(resource.id)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* All Resources */}
      <div className="all-resources">
        <div className="section-header">
          <h2>All Resources ({filteredResources.length})</h2>
          <div className="view-options">
            <span>Showing: {filter === 'all' ? 'All categories' : filter}</span>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="no-resources">
            <p>No resources found. Try a different search or filter.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-header">
                  <span className="resource-type">{getTypeIcon(resource.type)} {resource.type}</span>
                  <button 
                    className="save-icon-btn"
                    onClick={() => handleSaveResource(resource.id)}
                    title="Save resource"
                  >
                    💾
                  </button>
                </div>
                <h3>{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-tags">
                  {resource.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="resource-footer">
                  <span className="resource-category">{resource.category}</span>
                  <button 
                    className="visit-link"
                    onClick={() => handleResourceClick(resource.url)}
                  >
                    Open →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Categories */}
      <div className="categories-section">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => setFilter('frontend')}>
            <div className="category-icon">🎨</div>
            <h3>Frontend</h3>
            <p>HTML, CSS, JavaScript, React, Vue</p>
            <span className="count">{resources.filter(r => r.category === 'Frontend').length} resources</span>
          </div>
          <div className="category-card" onClick={() => setFilter('backend')}>
            <div className="category-icon">⚙️</div>
            <h3>Backend</h3>
            <p>Node.js, Python, Java, APIs</p>
            <span className="count">{resources.filter(r => r.category === 'Backend').length} resources</span>
          </div>
          <div className="category-card" onClick={() => setFilter('database')}>
            <div className="category-icon">🗃️</div>
            <h3>Database</h3>
            <p>MongoDB, SQL, Redis, PostgreSQL</p>
            <span className="count">{resources.filter(r => r.category === 'Database').length} resources</span>
          </div>
          <div className="category-card" onClick={() => setFilter('tools')}>
            <div className="category-icon">🔧</div>
            <h3>Tools</h3>
            <p>Git, Docker, VS Code, DevOps</p>
            <span className="count">{resources.filter(r => r.category === 'Tools').length} resources</span>
          </div>
        </div>
      </div>

      {/* Saved Resources */}
      <div className="saved-section">
        <h2>Your Saved Resources</h2>
        <div className="saved-resources">
          {(() => {
            const savedIds = JSON.parse(localStorage.getItem('savedResources') || '[]');
            const saved = resources.filter(r => savedIds.includes(r.id));
            
            return saved.length > 0 ? (
              <div className="saved-list">
                {saved.map(resource => (
                  <div key={resource.id} className="saved-item">
                    <span>{resource.title}</span>
                    <div className="saved-actions">
                      <button onClick={() => handleResourceClick(resource.url)}>Open</button>
                      <button 
                        onClick={() => {
                          const newSaved = savedIds.filter(id => id !== resource.id);
                          localStorage.setItem('savedResources', JSON.stringify(newSaved));
                          alert('Resource removed from saved!');
                          window.location.reload(); // Refresh to update
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-saved">No saved resources yet. Click the save button on any resource to add it here.</p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Resources;