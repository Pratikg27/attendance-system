import { useState, useEffect } from 'react';
import { getAttendanceRecords, downloadAttendanceExcel, downloadAttendancePDF } from '../services/api';
import '../styles/Dashboard.css';

function AdminAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceRecords(filters);
      setAttendanceRecords(response.data.records || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      alert('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    fetchAttendance();
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await downloadAttendanceExcel(params.toString());
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_Report_${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Excel report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to download Excel report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await downloadAttendancePDF(params.toString());
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_Report_${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ PDF report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to download PDF report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>📊 Attendance Reports</h1>
        <p className="welcome-subtitle">View and download attendance records</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>📅 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="Enter Employee ID"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔍 Search
          </button>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="download-section" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>📥 Download Reports</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={handleDownloadExcel}
            disabled={loading}
            style={{
              padding: '12px 25px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Processing...' : '📊 Download Excel'}
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={loading}
            style={{
              padding: '12px 25px',
              backgroundColor: loading ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Processing...' : '📄 Download PDF'}
          </button>
        </div>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '13px' }}>
          💡 Reports will include records based on your filter selections
        </p>
      </div>

      {/* Attendance Records Table */}
      <div className="table-section" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>📋 Recent Records</h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : attendanceRecords.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No records found. Try adjusting your filters.
          </p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Employee Code</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Clock In</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Clock Out</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hours</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{record.employee_code || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{record.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{record.date || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{record.clock_in_time || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{record.clock_out_time || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{record.total_hours || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: 
                          record.status === 'Present' ? '#d4edda' :
                          record.status === 'Half Day' ? '#fff3cd' :
                          record.status === 'Late' ? '#f8d7da' : '#e2e3e5',
                        color:
                          record.status === 'Present' ? '#155724' :
                          record.status === 'Half Day' ? '#856404' :
                          record.status === 'Late' ? '#721c24' : '#383d41'
                      }}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAttendance;

