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

// Driver login
router.post('/driver-login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM teams WHERE primary_driver_email = ?', [email], (err, team) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!team) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!team.password) {
      return res.status(400).json({ error: 'No password set for this account. Please contact admin.' });
    }

    // For demo purposes, compare plain text (in production, use bcrypt.compare)
    if (password === team.password) {
      const token = jwt.sign({ id: team.id, role: 'driver', team_id: team.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
      res.json({ token, user: { id: team.id, email: team.primary_driver_email, team_name: team.team_name, role: 'driver' } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

module.exports = router;
