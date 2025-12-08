import { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import Attendance from './Attendance';
import LeaveRequest from './LeaveRequest';
import UploadDocuments from './UploadDocuments';
import Payroll from './Payroll';
import '../styles/Dashboard.css';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userData = localStorage.getItem('user');
  const userType = localStorage.getItem('userType');
  
  const [user] = useState(() => {
    if (!userData || userType !== 'employee') {
      navigate('/employee/login');
      return null;
    }
    return JSON.parse(userData);
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.clear();
    
    window.location.replace('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>🏢 Employee Portal</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <ul className="sidebar-menu">
            <li>
              <Link 
                to="/employee/dashboard" 
                className={location.pathname === '/employee/dashboard' ? 'active' : ''}
              >
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/employee/dashboard/attendance" 
                className={location.pathname.includes('attendance') ? 'active' : ''}
              >
                ⏰ Attendance
              </Link>
            </li>
            <li>
              <Link 
                to="/employee/dashboard/leave" 
                className={location.pathname.includes('leave') ? 'active' : ''}
              >
                🏖️ Leave Request
              </Link>
            </li>
            <li>
              <Link 
                to="/employee/dashboard/payroll" 
                className={location.pathname.includes('payroll') ? 'active' : ''}
              >
                💰 My Salary
              </Link>
            </li>
            <li>
              <Link 
                to="/employee/dashboard/documents" 
                className={location.pathname.includes('documents') ? 'active' : ''}
              >
                📄 My Documents
              </Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<LeaveRequest />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/documents" element={<UploadDocuments />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ user }) {
  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p className="welcome-subtitle">Here's your dashboard overview</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📧</div>
          <h3>Email</h3>
          <p>{user.email}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">💼</div>
          <h3>Department</h3>
          <p>{user.department || 'Not Assigned'}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📱</div>
          <h3>Phone</h3>
          <p>{user.phone || 'Not Provided'}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">✅</div>
          <h3>Status</h3>
          <p className="status-active">Active</p>
        </div>
      </div>

      <div className="info-section">
        <h2>📋 Quick Actions</h2>
        <div className="feature-list">
          <Link to="/employee/dashboard/attendance" className="feature-item">
            ⏰ Mark Attendance
          </Link>
          <Link to="/employee/dashboard/leave" className="feature-item">
            🏖️ Request Leave
          </Link>
          <Link to="/employee/dashboard/payroll" className="feature-item">
            💰 View Salary Slips
          </Link>
          <Link to="/employee/dashboard/documents" className="feature-item">
            📄 Upload Documents
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;