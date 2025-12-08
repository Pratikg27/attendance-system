import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminLeaveRequests from '../components/AdminLeaveRequests';
import AdminPayroll from '../components/AdminPayroll';
import AdminAttendance from '../components/AdminAttendance';
import EmployeeManagement from '../components/EmployeeManagement';
import '../styles/Dashboard.css';

function AdminDashboard() {
  const location = useLocation();
  
  const userData = localStorage.getItem('user');
  const userType = localStorage.getItem('userType');
  
  const [user] = useState(() => {
    if (!userData || userType !== 'admin') {
      window.location.replace('/admin/login');
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
        <h2>👨‍💼 Admin Portal</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0) || 'A'}</div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <ul className="sidebar-menu">
            <li>
              <Link 
                to="/admin/dashboard" 
                className={location.pathname === '/admin/dashboard' ? 'active' : ''}
              >
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/dashboard/leave-requests" 
                className={location.pathname.includes('leave-requests') ? 'active' : ''}
              >
                ⏳ Leave Requests
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/dashboard/payroll" 
                className={location.pathname.includes('payroll') ? 'active' : ''}
              >
                💰 Payroll
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/dashboard/employees" 
                className={location.pathname.includes('employees') ? 'active' : ''}
              >
                👥 Employees
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/dashboard/attendance" 
                className={location.pathname.includes('attendance') ? 'active' : ''}
              >
                📊 Attendance
              </Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<AdminDashboardHome user={user} />} />
            <Route path="/leave-requests" element={<AdminLeaveRequests />} />
            <Route path="/payroll" element={<AdminPayroll />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/attendance" element={<AdminAttendance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Admin Dashboard Home Component
function AdminDashboardHome({ user }) {
  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p className="welcome-subtitle">Admin Control Panel</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📧</div>
          <h3>Email</h3>
          <p>{user.email}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👨‍💼</div>
          <h3>Role</h3>
          <p>Administrator</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⏳</div>
          <h3>Pending Requests</h3>
          <p className="status-active">View All</p>
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
          <Link to="/admin/dashboard/leave-requests" className="feature-item">
            ⏳ Manage Leave Requests
          </Link>
          <Link to="/admin/dashboard/payroll" className="feature-item">
            💰 Generate Salary Slips
          </Link>
          <Link to="/admin/dashboard/employees" className="feature-item">
            👥 Manage Employees
          </Link>
          <Link to="/admin/dashboard/attendance" className="feature-item">
            📊 View Attendance Reports
          </Link>
        </div>
      </div>
    </div>
  );
}

// Coming Soon Component
function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <h2>{title}</h2>
      <p>Coming soon...</p>
    </div>
  );
}

export default AdminDashboard;