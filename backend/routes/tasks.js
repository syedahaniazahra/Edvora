const express = require('express');
const router = express.Router();

// In-memory database (for demo)
const tasks = [];

// Get all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// Create new task
router.post('/', (req, res) => {
  const task = {
    id: tasks.length + 1,
    ...req.body,
    createdAt: new Date(),
    status: 'pending'
  };
  
  tasks.push(task);
  res.status(201).json(task);
});

// Update task
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// Delete task
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;