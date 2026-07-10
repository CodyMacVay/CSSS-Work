const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all passengers
router.get('/', (req, res) => {
  db.all('SELECT * FROM passengers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get passengers by team ID
router.get('/team/:teamId', (req, res) => {
  db.all('SELECT * FROM passengers WHERE team_id = ?', [req.params.teamId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create passenger details
router.post('/', (req, res) => {
  const {
    team_id,
    team_name,
    primary_driver_name,
    driver_2_name,
    driver_3_name,
    driver_4_name,
    rooms_required,
    room_type,
    driver_1_dietary,
    driver_2_dietary,
    driver_3_dietary,
    driver_4_dietary
  } = req.body;

  const sql = `
    INSERT INTO passengers (
      team_id, team_name, primary_driver_name, driver_2_name, driver_3_name, driver_4_name,
      rooms_required, room_type, driver_1_dietary, driver_2_dietary, driver_3_dietary, driver_4_dietary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    team_id,
    team_name,
    primary_driver_name,
    driver_2_name,
    driver_3_name,
    driver_4_name,
    rooms_required,
    room_type,
    driver_1_dietary,
    driver_2_dietary,
    driver_3_dietary,
    driver_4_dietary
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      id: this.lastID,
      team_id,
      team_name,
      message: 'Passenger details saved successfully'
    });
  });
});

// Update passenger details
router.put('/:id', (req, res) => {
  const {
    driver_2_name,
    driver_3_name,
    driver_4_name,
    rooms_required,
    room_type,
    driver_1_dietary,
    driver_2_dietary,
    driver_3_dietary,
    driver_4_dietary
  } = req.body;

  const sql = `
    UPDATE passengers 
    SET driver_2_name = ?, driver_3_name = ?, driver_4_name = ?,
        rooms_required = ?, room_type = ?, 
        driver_1_dietary = ?, driver_2_dietary = ?, driver_3_dietary = ?, driver_4_dietary = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    driver_2_name,
    driver_3_name,
    driver_4_name,
    rooms_required,
    room_type,
    driver_1_dietary,
    driver_2_dietary,
    driver_3_dietary,
    driver_4_dietary,
    req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Passenger details updated successfully', changes: this.changes });
  });
});

// Delete passenger details
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM passengers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Passenger details deleted successfully', changes: this.changes });
  });
});

module.exports = router;
