const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const db = require('../database');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Send email
router.post('/email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });

    // Log notification
    if (req.body.team_id) {
      db.run(
        'INSERT INTO notifications (team_id, type, recipient, status, message) VALUES (?, ?, ?, ?, ?)',
        [req.body.team_id, 'email', to, 'sent', subject]
      );
    }

    res.json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send SMS
router.post('/sms', async (req, res) => {
  const { to, body } = req.body;

  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return res.status(500).json({ error: 'SMS not configured' });
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    // Log notification
    if (req.body.team_id) {
      db.run(
        'INSERT INTO notifications (team_id, type, recipient, status, message) VALUES (?, ?, ?, ?, ?)',
        [req.body.team_id, 'sms', to, 'sent', body]
      );
    }

    res.json({ message: 'SMS sent successfully', sid: message.sid });
  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Send confirmation email on application
router.post('/confirmation/application', async (req, res) => {
  const { team_id, team_name, primary_driver_email, primary_driver_name } = req.body;

  const subject = 'P2P Venice - Application Received';
  const text = `Dear ${primary_driver_name},

Thank you for your application to the P2P Venice event.

Team Name: ${team_name}
Application ID: ${team_id}

Your application has been received and is currently being reviewed. You will be notified once it has been processed.

Best regards,
P2P Venice Team`;

  const html = `
    <h2>P2P Venice - Application Received</h2>
    <p>Dear ${primary_driver_name},</p>
    <p>Thank you for your application to the P2P Venice event.</p>
    <p><strong>Team Name:</strong> ${team_name}</p>
    <p><strong>Application ID:</strong> ${team_id}</p>
    <p>Your application has been received and is currently being reviewed. You will be notified once it has been processed.</p>
    <p>Best regards,<br>P2P Venice Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: primary_driver_email,
      subject,
      text,
      html
    });

    db.run(
      'INSERT INTO notifications (team_id, type, recipient, status, message) VALUES (?, ?, ?, ?, ?)',
      [team_id, 'email', primary_driver_email, 'sent', 'Application confirmation']
    );

    res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Confirmation email error:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

// Send confirmation email on approval/payment
router.post('/confirmation/approval', async (req, res) => {
  const { team_id, team_name, primary_driver_email, primary_driver_name, ferry_booking_reference } = req.body;

  const subject = 'P2P Venice - Application Approved';
  const text = `Dear ${primary_driver_name},

Congratulations! Your application to the P2P Venice event has been approved.

Team Name: ${team_name}
Application ID: ${team_id}
Ferry Booking Reference: ${ferry_booking_reference || 'TBA'}

Please ensure you have completed your passenger details through the portal.

Best regards,
P2P Venice Team`;

  const html = `
    <h2>P2P Venice - Application Approved</h2>
    <p>Dear ${primary_driver_name},</p>
    <p>Congratulations! Your application to the P2P Venice event has been approved.</p>
    <p><strong>Team Name:</strong> ${team_name}</p>
    <p><strong>Application ID:</strong> ${team_id}</p>
    <p><strong>Ferry Booking Reference:</strong> ${ferry_booking_reference || 'TBA'}</p>
    <p>Please ensure you have completed your passenger details through the portal.</p>
    <p>Best regards,<br>P2P Venice Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: primary_driver_email,
      subject,
      text,
      html
    });

    db.run(
      'INSERT INTO notifications (team_id, type, recipient, status, message) VALUES (?, ?, ?, ?, ?)',
      [team_id, 'email', primary_driver_email, 'sent', 'Approval confirmation']
    );

    res.json({ message: 'Approval confirmation email sent' });
  } catch (error) {
    console.error('Approval email error:', error);
    res.status(500).json({ error: 'Failed to send approval email' });
  }
});

// Get notification history
router.get('/history/:teamId', (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE team_id = ? ORDER BY created_at DESC',
    [req.params.teamId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
