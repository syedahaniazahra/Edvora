const express = require('express');
const router = express.Router();

const skills = [
  {
    id: 1,
    name: 'Web Development',
    category: 'Programming',
    description: 'Build websites and web applications',
    resources: [
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { name: 'FreeCodeCamp', url: 'https://freecodecamp.org' }
    ]
  },
  {
    id: 2,
    name: 'Data Science',
    category: 'Analytics',
    description: 'Analyze and visualize data',
    resources: [
      { name: 'Kaggle', url: 'https://kaggle.com' },
      { name: 'DataCamp', url: 'https://datacamp.com' }
    ]
  },
  {
    id: 3,
    name: 'UI/UX Design',
    category: 'Design',
    description: 'Design user interfaces and experiences',
    resources: [
      { name: 'Figma', url: 'https://figma.com' },
      { name: 'Adobe XD', url: 'https://adobe.com/xd' }
    ]
  },
  {
    id: 4,
    name: 'Mobile Development',
    category: 'Programming',
    description: 'Build mobile applications',
    resources: [
      { name: 'Flutter', url: 'https://flutter.dev' },
      { name: 'React Native', url: 'https://reactnative.dev' }
    ]
  }
];

// Get all skills
router.get('/', (req, res) => {
  res.json(skills);
});

// Get skill by ID
router.get('/:id', (req, res) => {
  const skill = skills.find(s => s.id === parseInt(req.params.id));
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  res.json(skill);
});

module.exports = router;