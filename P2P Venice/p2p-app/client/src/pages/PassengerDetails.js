import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PassengerDetails.css';

function PassengerDetails() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [formData, setFormData] = useState({
    team_id: teamId,
    team_name: '',
    primary_driver_name: '',
    driver_2_name: '',
    driver_3_name: '',
    driver_4_name: '',
    rooms_required: 0,
    room_type: '',
    driver_1_dietary: '',
    driver_2_dietary: '',
    driver_3_dietary: '',
    driver_4_dietary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamId}`);
      setTeamData(response.data);
      setFormData(prev => ({
        ...prev,
        team_name: response.data.team_name,
        primary_driver_name: response.data.primary_driver_name
      }));

      // Check if passenger details already exist
      const passengerResponse = await axios.get(`/api/passengers/team/${teamId}`);
      if (passengerResponse.data && passengerResponse.data.length > 0) {
        const existing = passengerResponse.data[0];
        setFormData(prev => ({
          ...prev,
          ...existing
        }));
      }
    } catch (err) {
      setError('Failed to load team data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if updating or creating
      const existingResponse = await axios.get(`/api/passengers/team/${teamId}`);
      
      if (existingResponse.data && existingResponse.data.length > 0) {
        // Update existing
        await axios.put(`/api/passengers/${existingResponse.data[0].id}`, formData);
      } else {
        // Create new
        await axios.post('/api/passengers', formData);
      }

      setSuccess('Passenger details saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save passenger details');
    } finally {
      setLoading(false);
    }
  };

  if (!teamData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="passenger-container">
      <div className="passenger-card">
        <h2>Passenger Details</h2>
        <p className="subtitle">Complete your team's passenger information</p>
        <p className="team-info">Team: {teamData.team_name}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <h3>Driver Information</h3>
          
          <div className="form-group">
            <label>Primary Driver Name</label>
            <input
              type="text"
              name="primary_driver_name"
              value={formData.primary_driver_name}
              disabled
              className="disabled"
            />
          </div>

          <div className="form-group">
            <label>Driver 2 Name</label>
            <input
              type="text"
              name="driver_2_name"
              value={formData.driver_2_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Driver 3 Name</label>
            <input
              type="text"
              name="driver_3_name"
              value={formData.driver_3_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Driver 4 Name</label>
            <input
              type="text"
              name="driver_4_name"
              value={formData.driver_4_name}
              onChange={handleChange}
            />
          </div>

          <h3>Accommodation</h3>

          <div className="form-group">
            <label>Number of Rooms Required</label>
            <input
              type="number"
              name="rooms_required"
              value={formData.rooms_required}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
            >
              <option value="">Select room type</option>
              <option value="single">Single</option>
              <option value="twin">Twin</option>
              <option value="double">Double</option>
            </select>
          </div>

          <h3>Dietary Requirements</h3>

          <div className="form-group">
            <label>Driver 1 Dietary Requirements</label>
            <input
              type="text"
              name="driver_1_dietary"
              value={formData.driver_1_dietary}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Gluten-free, None"
            />
          </div>

          <div className="form-group">
            <label>Driver 2 Dietary Requirements</label>
            <input
              type="text"
              name="driver_2_dietary"
              value={formData.driver_2_dietary}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Gluten-free, None"
            />
          </div>

          <div className="form-group">
            <label>Driver 3 Dietary Requirements</label>
            <input
              type="text"
              name="driver_3_dietary"
              value={formData.driver_3_dietary}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Gluten-free, None"
            />
          </div>

          <div className="form-group">
            <label>Driver 4 Dietary Requirements</label>
            <input
              type="text"
              name="driver_4_dietary"
              value={formData.driver_4_dietary}
              onChange={handleChange}
              placeholder="e.g., Vegetarian, Gluten-free, None"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Passenger Details'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Registration
          </button>
        </form>
      </div>
    </div>
  );
}

export default PassengerDetails;
