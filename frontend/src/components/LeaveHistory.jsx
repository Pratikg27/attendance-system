import { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Leave.css';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await api.get('/leaves/my-leaves');
        setLeaves(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      Pending: '⏳ Pending',
      Approved: '✅ Approved',
      Rejected: '❌ Rejected'
    };
    return badges[status] || status;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="leave-history-container">
      <h2>📋 My Leave History</h2>
      
      {leaves.length === 0 ? (
        <p className="no-data">No leave requests found.</p>
      ) : (
        <div className="leave-table">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.leave_id}>
                  <td><span className="leave-type-badge">{leave.leave_type}</span></td>
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span className={`status-badge ${leave.status.toLowerCase()}`}>
                      {getStatusBadge(leave.status)}
                    </span>
                  </td>
                  <td>{new Date(leave.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;