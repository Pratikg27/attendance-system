import { useState, useEffect } from 'react';
import { getPendingLeaves, updateLeaveStatus } from '../services/api';
import '../styles/Leave.css';

const AdminLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Define function BEFORE useEffect
  const fetchPendingLeaves = async () => {
    try {
      const response = await getPendingLeaves();
      setLeaves(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLoading(false);
    }
  };

  // Fetch pending leaves on component mount - this is the correct pattern for data fetching
  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleStatusUpdate = async (leaveId, status) => {
    setProcessing(leaveId);
    const remarks = prompt(`Enter remarks for ${status.toLowerCase()}:`);
    
    try {
      await updateLeaveStatus(leaveId, { status, admin_remarks: remarks });
      alert(`Leave ${status.toLowerCase()} successfully!`);
      fetchPendingLeaves(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-leave-container">
      <h2>📋 Pending Leave Requests</h2>
      
      {leaves.length === 0 ? (
        <p className="no-data">No pending leave requests.</p>
      ) : (
        <div className="leave-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.leave_id}>
                  <td>
                    <strong>{leave.name}</strong><br />
                    <small>{leave.email}</small>
                  </td>
                  <td>{leave.department}</td>
                  <td><span className="leave-type-badge">{leave.leave_type}</span></td>
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleStatusUpdate(leave.leave_id, 'Approved')}
                        disabled={processing === leave.leave_id}
                        className="approve-btn"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave.leave_id, 'Rejected')}
                        disabled={processing === leave.leave_id}
                        className="reject-btn"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveRequests;