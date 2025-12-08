import { useState, useEffect } from 'react';
import api from '../services/api';
import './Attendance.css';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clockStatus, setClockStatus] = useState({
    isClockedIn: false,
    canClockIn: true,
    canClockOut: false,
    checkIn: null,
    checkOut: null,
    totalHours: 0,
    status: null
  });
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    late: 0,
    total: 0,
    totalHoursWorked: 0
  });
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch clock status on mount
  useEffect(() => {
    fetchClockStatus();
    fetchAttendance();
  }, []);

  const fetchClockStatus = async () => {
    try {
      const response = await api.get('/attendance/clock-status');
      console.log('🕐 Clock Status:', response.data);
      setClockStatus(response.data);
    } catch (error) {
      console.error('❌ Error fetching clock status:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const employee_id = user?.employee_id || user?.id;
      
      console.log('🕐 Attempting clock in for employee:', employee_id);
      
      const response = await api.post('/attendance/clock-in', { employee_id });
      console.log('✅ Clock In Response:', response.data);
      
      showSuccessAnimation(`Clocked In - ${response.data.status}`);
      
      // Refresh status and attendance
      await fetchClockStatus();
      await fetchAttendance();
    } catch (error) {
      console.error('❌ Clock in error:', error);
      showErrorAnimation(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const employee_id = user?.employee_id || user?.id;
      
      console.log('🕐 Attempting clock out for employee:', employee_id);
      
      const response = await api.post('/attendance/clock-out', { employee_id });
      console.log('✅ Clock Out Response:', response.data);
      
      showSuccessAnimation(`Clocked Out - Worked ${response.data.totalHours} hours`);
      
      // Refresh status and attendance
      await fetchClockStatus();
      await fetchAttendance();
    } catch (error) {
      console.error('❌ Clock out error:', error);
      showErrorAnimation(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const employee_id = user?.employee_id || user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📋 Marking attendance:', { employee_id, status, date: today });
      
      const response = await api.post('/attendance/mark', { 
        employee_id,
        status,
        date: today 
      });
      
      console.log('✅ Mark Response:', response.data);
      
      showSuccessAnimation(`${status} marked successfully!`);
      
      // Refresh status and attendance
      await fetchClockStatus();
      await fetchAttendance();
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error);
      showErrorAnimation(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessAnimation = (message) => {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const showErrorAnimation = (message) => {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const fetchAttendance = async () => {
    try {
      console.log('📊 Fetching attendance records...');
      const response = await api.get('/attendance/my-attendance');
      console.log('📊 Attendance Response:', response.data);
      
      const attendanceData = response.data.attendances || response.data || [];
      const attendanceArray = Array.isArray(attendanceData) ? attendanceData : [];
      setAttendance(attendanceArray);
      
      // Calculate stats - use total_hours or hours_worked
      const totalHours = attendanceArray.reduce((sum, record) => {
        return sum + (parseFloat(record.total_hours) || parseFloat(record.hours_worked) || 0);
      }, 0);

      const statsData = {
        present: attendanceArray.filter(a => a.status === 'Present').length,
        absent: attendanceArray.filter(a => a.status === 'Absent').length,
        halfDay: attendanceArray.filter(a => a.status === 'Half Day').length,
        late: attendanceArray.filter(a => a.status === 'Late').length,
        total: attendanceArray.length,
        totalHoursWorked: totalHours.toFixed(2)
      };
      setStats(statsData);
      
      console.log('✅ Stats calculated:', statsData);
      
    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      setAttendance([]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Present': return '✅';
      case 'Absent': return '❌';
      case 'Half Day': return '⏱️';
      case 'Late': return '⏰';
      default: return '📋';
    }
  };

  const filteredAttendance = filter === 'all' 
    ? attendance 
    : attendance.filter(record => record.status === filter);

  const attendancePercentage = stats.total > 0 
    ? ((stats.present + stats.late) / stats.total * 100).toFixed(1)
    : 0;

  return (
    <div className="attendance-page">
      {/* Hero Section with Clock */}
      <div className="attendance-hero">
        <div className="hero-content">
          <div className="live-clock">
            <div className="clock-time">{formatTime(currentTime)}</div>
            <div className="clock-date">{formatDate(currentTime)}</div>
          </div>
          <h1 className="hero-title">⏰ Attendance Management</h1>
          <p className="hero-subtitle">Track your work hours and attendance</p>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <div className="clock-section">
        <h2 className="section-title">🕐 Clock In/Out</h2>
        
        <div className="clock-status-card">
          <div className="status-info">
            {clockStatus.isClockedIn ? (
              <div className="clocked-in-status">
                <div className="status-badge active">🟢 Clocked In</div>
                <div className="time-info">
                  <div className="time-row">
                    <span className="time-label">Clock In:</span>
                    <span className="time-value">{formatDateTime(clockStatus.checkIn)}</span>
                  </div>
                  <div className="time-row">
                    <span className="time-label">Status:</span>
                    <span className={`status-tag status-${clockStatus.status?.toLowerCase()}`}>
                      {getStatusIcon(clockStatus.status)} {clockStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : clockStatus.checkOut ? (
              <div className="clocked-out-status">
                <div className="status-badge completed">✅ Completed</div>
                <div className="time-info">
                  <div className="time-row">
                    <span className="time-label">Clock In:</span>
                    <span className="time-value">{formatDateTime(clockStatus.checkIn)}</span>
                  </div>
                  <div className="time-row">
                    <span className="time-label">Clock Out:</span>
                    <span className="time-value">{formatDateTime(clockStatus.checkOut)}</span>
                  </div>
                  <div className="time-row highlight">
                    <span className="time-label">Total Hours:</span>
                    <span className="time-value-large">{clockStatus.totalHours} hrs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="not-clocked-status">
                <div className="status-badge inactive">⚪ Not Clocked In</div>
                <p className="status-message">Ready to start your day? Clock in now!</p>
              </div>
            )}
          </div>

          <div className="clock-actions">
            <button
              onClick={handleClockIn}
              disabled={loading || !clockStatus.canClockIn}
              className="clock-btn clock-in-btn"
            >
              <span className="btn-icon">🟢</span>
              <span className="btn-text">Clock In</span>
            </button>
            
            <button
              onClick={handleClockOut}
              disabled={loading || !clockStatus.canClockOut}
              className="clock-btn clock-out-btn"
            >
              <span className="btn-icon">🔴</span>
              <span className="btn-text">Clock Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Manual Marking */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Manual Marking</h2>
        <div className="attendance-actions">
          <button 
            onClick={() => markAttendance('Present')} 
            disabled={loading}
            className="attendance-btn btn-present"
          >
            <span className="btn-icon">✅</span>
            <span className="btn-text">Mark Present</span>
          </button>
          
          <button 
            onClick={() => markAttendance('Absent')} 
            disabled={loading}
            className="attendance-btn btn-absent"
          >
            <span className="btn-icon">❌</span>
            <span className="btn-text">Mark Absent</span>
          </button>
          
          <button 
            onClick={() => markAttendance('Half Day')} 
            disabled={loading}
            className="attendance-btn btn-halfday"
          >
            <span className="btn-icon">⏱️</span>
            <span className="btn-text">Half Day</span>
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-section">
        <h2 className="section-title">📊 Your Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Days</div>
            </div>
          </div>
          
          <div className="stat-card stat-present">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          
          <div className="stat-card stat-late">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <div className="stat-value">{stats.late}</div>
              <div className="stat-label">Late</div>
            </div>
          </div>
          
          <div className="stat-card stat-hours">
            <div className="stat-icon">⏲️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalHoursWorked}</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
          
          <div className="stat-card stat-halfday">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.halfDay}</div>
              <div className="stat-label">Half Days</div>
            </div>
          </div>
          
          <div className="stat-card stat-absent">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          
          <div className="stat-card stat-percentage">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-value">{attendancePercentage}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="history-section">
        <div className="history-header">
          <h2 className="section-title">📋 Attendance History</h2>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({attendance.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'Present' ? 'active' : ''}`}
              onClick={() => setFilter('Present')}
            >
              Present ({stats.present})
            </button>
            <button 
              className={`filter-btn ${filter === 'Late' ? 'active' : ''}`}
              onClick={() => setFilter('Late')}
            >
              Late ({stats.late})
            </button>
            <button 
              className={`filter-btn ${filter === 'Absent' ? 'active' : ''}`}
              onClick={() => setFilter('Absent')}
            >
              Absent ({stats.absent})
            </button>
            <button 
              className={`filter-btn ${filter === 'Half Day' ? 'active' : ''}`}
              onClick={() => setFilter('Half Day')}
            >
              Half Day ({stats.halfDay})
            </button>
          </div>
        </div>

        <div className="attendance-table-container">
          {filteredAttendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Records Found</h3>
              <p>Start marking your attendance to see records here</p>
            </div>
          ) : (
            <div className="attendance-grid">
              {filteredAttendance.map((record) => (
                <div key={record.id} className={`attendance-card status-${record.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="card-header">
                    <span className="card-icon">{getStatusIcon(record.status)}</span>
                    <span className="card-status">{record.status}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-date">
                      📅 {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    {record.clock_in && (
                      <div className="card-time">
                        🕐 In: {formatDateTime(record.clock_in)}
                      </div>
                    )}
                    {record.clock_out && (
                      <div className="card-time">
                        🕐 Out: {formatDateTime(record.clock_out)}
                      </div>
                    )}
                    {(record.total_hours > 0 || record.hours_worked > 0) && (
                      <div className="card-hours">
                        ⏲️ Hours: <strong>{record.total_hours || record.hours_worked} hrs</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;