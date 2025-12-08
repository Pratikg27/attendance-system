import { useState } from 'react';
import LeaveBalance from '../components/LeaveBalance';
import ApplyLeave from '../components/ApplyLeave';
import LeaveHistory from '../components/LeaveHistory';
import Payroll from '../components/Payroll';
import '../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('balance');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
  // Clear all localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  localStorage.clear();
  
  // Force page reload and redirect
  window.location.replace('/');
};

  const handleLeaveSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('history');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {user.name || 'Employee'}</h1>
          <p>Employee ID: {user.employee_id}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'balance' ? 'active' : ''}
          onClick={() => setActiveTab('balance')}
        >
          Leave Balance
        </button>
        <button 
          className={activeTab === 'apply' ? 'active' : ''}
          onClick={() => setActiveTab('apply')}
        >
          Apply Leave
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Leave History
        </button>
        <button 
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button 
          className={activeTab === 'payroll' ? 'active' : ''}
          onClick={() => setActiveTab('payroll')}
        >
          My Salary
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'balance' && <LeaveBalance key={refreshKey} />}
        {activeTab === 'apply' && <ApplyLeave onSuccess={handleLeaveSuccess} />}
        {activeTab === 'history' && <LeaveHistory key={refreshKey} />}
        {activeTab === 'attendance' && (
          <div className="coming-soon">
            <h2>Attendance Module</h2>
            <p>Coming soon...</p>
          </div>
        )}
        {activeTab === 'payroll' && <Payroll />}
      </main>
    </div>
  );
};

export default EmployeeDashboard;