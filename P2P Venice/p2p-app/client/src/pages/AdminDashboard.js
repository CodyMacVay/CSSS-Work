import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationModal, setNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ type: 'email', message: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, teamsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/teams-full')
      ]);
      setStats(statsRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (teamId, newStatus) => {
    try {
      await axios.put(`/api/teams/${teamId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApprovePaid = async (teamId, approved) => {
    try {
      await axios.put(`/api/teams/${teamId}/status`, { approved_paid: approved });
      fetchData();
    } catch (err) {
      console.error('Error updating approval:', err);
    }
  };

  const handleFerryReference = async (teamId, reference) => {
    try {
      await axios.put(`/api/teams/${teamId}/status`, { ferry_booking_reference: reference });
      fetchData();
    } catch (err) {
      console.error('Error updating ferry reference:', err);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedTeam) return;

    try {
      if (notificationData.type === 'email') {
        await axios.post('/api/notifications/email', {
          to: selectedTeam.primary_driver_email,
          subject: 'P2P Venice Update',
          text: notificationData.message,
          html: `<p>${notificationData.message}</p>`,
          team_id: selectedTeam.id
        });
      } else {
        await axios.post('/api/notifications/sms', {
          to: selectedTeam.primary_driver_phone,
          body: notificationData.message,
          team_id: selectedTeam.id
        });
      }
      setNotificationModal(false);
      setNotificationData({ type: 'email', message: '' });
      alert('Notification sent successfully');
    } catch (err) {
      alert('Failed to send notification');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  const handleExportReport = async () => {
    try {
      const response = await axios.get('/api/admin/report');
      const csv = [
        Object.keys(response.data[0]).join(','),
        ...response.data.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'p2p_venice_report.csv';
      a.click();
    } catch (err) {
      alert('Failed to export report');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Report
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Teams</h3>
            <p className="stat-number">{stats?.total || 0}</p>
            <p className="stat-label">/ 40 max</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number pending">{stats?.pending || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number approved">{stats?.approved || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Paid</h3>
            <p className="stat-number paid">{stats?.paid || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Waiting List</h3>
            <p className="stat-number waiting">{stats?.waiting_list || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="teams-section">
          <div className="teams-header">
            <h2>All Teams</h2>
            <button className="btn btn-export" onClick={handleExportReport}>Export Report</button>
          </div>
          <div className="teams-table-container">
            <table className="teams-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Primary Driver</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Paid</th>
                  <th>Ferry Ref</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id}>
                    <td>{team.team_name}</td>
                    <td>{team.primary_driver_name}</td>
                    <td>{team.primary_driver_email}</td>
                    <td>
                      <select
                        value={team.status}
                        onChange={(e) => handleStatusChange(team.id, e.target.value)}
                        className={`status-select ${team.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waiting_list">Waiting List</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={team.approved_paid === 1}
                        onChange={(e) => handleApprovePaid(team.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={team.ferry_booking_reference || ''}
                        onChange={(e) => handleFerryReference(team.id, e.target.value)}
                        placeholder="TBA"
                        className="ferry-input"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-small btn-notify"
                        onClick={() => {
                          setSelectedTeam(team);
                          setNotificationModal(true);
                        }}
                      >
                        Notify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="report-section">
          <div className="report-header">
            <h2>Full Report</h2>
            <button className="btn btn-export" onClick={handleExportReport}>Export CSV</button>
          </div>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Driver 1</th>
                  <th>Driver 2</th>
                  <th>Driver 3</th>
                  <th>Driver 4</th>
                  <th>Rooms</th>
                  <th>Type</th>
                  <th>Dietary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id}>
                    <td>{team.team_name}</td>
                    <td>{team.primary_driver_name}</td>
                    <td>{team.driver_2_name || '-'}</td>
                    <td>{team.driver_3_name || '-'}</td>
                    <td>{team.driver_4_name || '-'}</td>
                    <td>{team.rooms_required || 0}</td>
                    <td>{team.room_type || '-'}</td>
                    <td>{team.driver_1_dietary || '-'}</td>
                    <td className={`status-${team.status}`}>{team.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notificationModal && selectedTeam && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Send Notification</h3>
            <p>To: {selectedTeam.primary_driver_name} ({selectedTeam.primary_driver_email})</p>
            
            <div className="form-group">
              <label>Type</label>
              <select
                value={notificationData.type}
                onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value })}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                rows={5}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setNotificationModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendNotification}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
