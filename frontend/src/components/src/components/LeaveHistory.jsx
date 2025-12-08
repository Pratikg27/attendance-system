import { useState, useEffect } from 'react';
import { getMyLeaves } from '../services/api';
import '../styles/Leave.css';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define function BEFORE useEffect
  const fetchLeaves = async () => {
    try {
      const response = await getMyLeaves();
      setLeaves(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLoading(false);
    }
  };

  // Fetch leaves on component mount - this is the correct pattern for data fetching
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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