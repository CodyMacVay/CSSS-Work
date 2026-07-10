const express = require('express');
const router = express.Router();
const db = require('../database');

// Get dashboard stats
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM teams WHERE status != "rejected"',
    'SELECT COUNT(*) as pending FROM teams WHERE status = "pending"',
    'SELECT COUNT(*) as approved FROM teams WHERE status = "approved"',
    'SELECT COUNT(*) as waiting_list FROM teams WHERE status = "waiting_list"',
    'SELECT COUNT(*) as paid FROM teams WHERE approved_paid = 1'
  ];

  Promise.all(queries.map(q => 
    new Promise((resolve, reject) => {
      db.get(q, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  )).then(results => {
    res.json({
      total: results[0].total,
      pending: results[1].pending,
      approved: results[2].approved,
      waiting_list: results[3].waiting_list,
      paid: results[4].paid
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Get all teams with passenger details
router.get('/teams-full', (req, res) => {
  const sql = `
    SELECT 
      t.*,
      p.driver_2_name,
      p.driver_3_name,
      p.driver_4_name,
      p.rooms_required,
      p.room_type,
      p.driver_1_dietary,
      p.driver_2_dietary,
      p.driver_3_dietary,
      p.driver_4_dietary
    FROM teams t
    LEFT JOIN passengers p ON t.id = p.team_id
    ORDER BY t.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Bulk update team statuses
router.put('/teams/bulk-status', (req, res) => {
  const { teamIds, status } = req.body;

  if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
    return res.status(400).json({ error: 'Invalid team IDs' });
  }

  const placeholders = teamIds.map(() => '?').join(',');
  const sql = `UPDATE teams SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`;

  db.run(sql, [status, ...teamIds], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Teams updated successfully', changes: this.changes });
  });
});

// Get report data
router.get('/report', (req, res) => {
  const sql = `
    SELECT 
      t.team_name,
      t.primary_driver_name,
      t.primary_driver_email,
      t.primary_driver_phone,
      t.status,
      t.approved_paid,
      t.ferry_booking_reference,
      t.emergency_contact_name,
      t.emergency_contact_details,
      p.driver_2_name,
      p.driver_3_name,
      p.driver_4_name,
      p.rooms_required,
      p.room_type,
      p.driver_1_dietary,
      p.driver_2_dietary,
      p.driver_3_dietary,
      p.driver_4_dietary,
      t.created_at
    FROM teams t
    LEFT JOIN passengers p ON t.id = p.team_id
    WHERE t.status != 'rejected'
    ORDER BY t.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
