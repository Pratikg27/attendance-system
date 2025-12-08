import React, { useState } from 'react';
import api from '../services/api';
import './ApplyLeave.css';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await api.post('/leaves/apply', formData);
      
      if (response.data.success) {
        setMessage({ 
          text: '✅ Leave application submitted successfully!', 
          type: 'success' 
        });
        setFormData({
          leave_type: 'Casual Leave',
          start_date: '',
          end_date: '',
          reason: ''
        });
      }
    } catch (error) {
      setMessage({ 
        text: '❌ ' + (error.response?.data?.message || 'Error submitting leave application'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-leave-container">
      <h2>📝 Apply for Leave</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-group">
          <label htmlFor="leave_type">Leave Type</label>
          <select
            id="leave_type"
            name="leave_type"
            value={formData.leave_type}
            onChange={handleChange}
            required
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            min={formData.start_date}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Enter reason for leave..."
            rows="4"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Submitting...' : '✅ Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;