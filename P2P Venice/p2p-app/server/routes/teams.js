const express = require('express');
const router = express.Router();
const db = require('../database');

const MAX_TEAMS = 40;

// Get all teams
router.get('/', (req, res) => {
  db.all('SELECT * FROM teams ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get team by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM teams WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(row);
  });
});

// Create new team registration
router.post('/', (req, res) => {
  const {
    team_name,
    primary_driver_name,
    primary_driver_email,
    primary_driver_phone,
    emergency_contact_name,
    emergency_contact_details,
    password,
    gdpr_consent
  } = req.body;

  if (!gdpr_consent) {
    return res.status(400).json({ error: 'GDPR consent is required' });
  }

  // Check if team limit is reached
  db.get('SELECT COUNT(*) as count FROM teams WHERE status != ?', ['rejected'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const status = result.count >= MAX_TEAMS ? 'waiting_list' : 'pending';

    const sql = `
      INSERT INTO teams (
        team_name, primary_driver_name, primary_driver_email, primary_driver_phone,
        emergency_contact_name, emergency_contact_details, password, status, gdpr_consent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      team_name,
      primary_driver_name,
      primary_driver_email,
      primary_driver_phone,
      emergency_contact_name,
      emergency_contact_details,
      password,
      status,
      gdpr_consent
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        team_name,
        primary_driver_name,
        primary_driver_email,
        status,
        message: status === 'waiting_list' 
          ? 'Team limit reached. You have been added to the waiting list.' 
          : 'Application submitted successfully'
      });
    });
  });
});

// Update team status (admin only)
router.put('/:id/status', (req, res) => {
  const { status, approved_paid, ferry_booking_reference } = req.body;

  const sql = `
    UPDATE teams 
    SET status = ?, approved_paid = ?, ferry_booking_reference = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [status, approved_paid || 0, ferry_booking_reference || null, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Team updated successfully', changes: this.changes });
  });
});

// Update team details
router.put('/:id', (req, res) => {
  const {
    team_name,
    primary_driver_name,
    primary_driver_email,
    primary_driver_phone,
    emergency_contact_name,
    emergency_contact_details,
    password
  } = req.body;

  const sql = `
    UPDATE teams 
    SET team_name = ?, primary_driver_name = ?, primary_driver_email = ?, primary_driver_phone = ?,
        emergency_contact_name = ?, emergency_contact_details = ?, password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    team_name,
    primary_driver_name,
    primary_driver_email,
    primary_driver_phone,
    emergency_contact_name,
    emergency_contact_details,
    password || null,
    req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Team updated successfully', changes: this.changes });
  });
});

// Delete team
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM teams WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Team deleted successfully', changes: this.changes });
  });
});

// Get team count
router.get('/stats/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM teams WHERE status != ?', ['rejected'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: result.count, max: MAX_TEAMS });
  });
});

module.exports = router;
