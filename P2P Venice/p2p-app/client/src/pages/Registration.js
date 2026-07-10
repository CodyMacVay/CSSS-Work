import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Registration.css';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    team_name: '',
    primary_driver_name: '',
    primary_driver_email: '',
    primary_driver_phone: '',
    emergency_contact_name: '',
    emergency_contact_details: '',
    gdpr_consent: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/teams', formData);
      setSuccess(response.data.message);
      
      // Send confirmation email
      if (response.data.id) {
        try {
          await axios.post('/api/notifications/confirmation/application', {
            team_id: response.data.id,
            team_name: formData.team_name,
            primary_driver_email: formData.primary_driver_email,
            primary_driver_name: formData.primary_driver_name
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }

      // Navigate to passenger details if approved
      if (response.data.status === 'pending') {
        setTimeout(() => {
          navigate(`/passengers/${response.data.id}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Team Registration</h2>
        <p className="subtitle">Register your team for the P2P Venice event</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name *</label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Driver Name *</label>
            <input
              type="text"
              name="primary_driver_name"
              value={formData.primary_driver_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Driver Email *</label>
            <input
              type="email"
              name="primary_driver_email"
              value={formData.primary_driver_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Driver Phone *</label>
            <input
              type="tel"
              name="primary_driver_phone"
              value={formData.primary_driver_phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact Name *</label>
            <input
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact Details *</label>
            <input
              type="text"
              name="emergency_contact_details"
              value={formData.emergency_contact_details}
              onChange={handleChange}
              required
              placeholder="Phone number and relationship"
            />
          </div>

          <div className="form-group gdpr-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="gdpr_consent"
                checked={formData.gdpr_consent}
                onChange={handleChange}
                required
              />
              <span>
                I consent to the processing of my personal data in accordance with the GDPR. 
                I understand that my data will be used for the purpose of the P2P Venice event registration.
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
