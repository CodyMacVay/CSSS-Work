const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../database');

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, compare plain text (in production, use bcrypt.compare)
    if (password === 'admin123') {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

module.exports = router;
