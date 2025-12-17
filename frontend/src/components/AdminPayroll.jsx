import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPayroll.css';

const AdminPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [salaryData, setSalaryData] = useState({
    basic_salary: '',
    allowances: '',
    deductions: '',
    bonus: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const fetchEmployees = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Employees fetched:', response.data);
    setEmployees(response.data);
  } catch (error) {
    console.error('Error fetching employees:', error);
    alert('Failed to fetch employees');
  }
};



 const fetchPayrolls = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Payrolls fetched:', response.data);
    setPayrolls(response.data.payroll || response.data || []);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    setPayrolls([]);
  }
};

  const handleGenerateSalary = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payroll/generate`,
        {
          employee_id: selectedEmployee,
          ...salaryData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Salary slip generated successfully!');
      setSalaryData({
        basic_salary: '',
        allowances: '',
        deductions: '',
        bonus: ''
      });
      setSelectedEmployee('');
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate salary slip');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/payroll/${payrollId}/mark-paid`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Marked as paid!');
      fetchPayrolls();
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      alert(error?.response?.data?.error || 'Failed to update payment status');
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(salaryData.basic_salary) || 0;
    const allowances = parseFloat(salaryData.allowances) || 0;
    const bonus = parseFloat(salaryData.bonus) || 0;
    const deductions = parseFloat(salaryData.deductions) || 0;
    return basic + allowances + bonus - deductions;
  };

  return (
    <div className="admin-payroll-container">
      <h1>💰 Payroll Management</h1>

      {/* Generate Salary Form */}
      <div className="payroll-form-section">
        <h2>Generate Salary Slip</h2>
        <form onSubmit={handleGenerateSalary} className="payroll-form">
          <div className="form-group">
            <label>Select Employee *</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.email} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Basic Salary (₹) *</label>
              <input
                type="number"
                value={salaryData.basic_salary}
                onChange={(e) => setSalaryData({ ...salaryData, basic_salary: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Allowances (₹)</label>
              <input
                type="number"
                value={salaryData.allowances}
                onChange={(e) => setSalaryData({ ...salaryData, allowances: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bonus (₹)</label>
              <input
                type="number"
                value={salaryData.bonus}
                onChange={(e) => setSalaryData({ ...salaryData, bonus: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Deductions (₹)</label>
              <input
                type="number"
                value={salaryData.deductions}
                onChange={(e) => setSalaryData({ ...salaryData, deductions: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="net-salary-display">
            <strong>Net Salary: ₹{calculateNetSalary().toFixed(2)}</strong>
          </div>

          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? 'Generating...' : '✅ Generate Salary Slip'}
          </button>
        </form>
      </div>

      {/* Payroll Records Table */}
      <div className="payroll-records-section">
        <h2>All Payroll Records ({payrolls.length})</h2>
        <div className="table-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Basic Salary</th>
                <th>HRA</th>
<th>Other Allowances</th>
<th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No payroll records yet. Generate your first salary slip above!
                  </td>
                </tr>
              ) : (
                payrolls.map(payroll => (
                  <tr key={payroll.id}>
                   <td>
  <strong>{payroll.name}</strong><br />
  <small>{payroll.email}</small>
</td>
                    <td>{new Date(payroll.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                    <td>₹{parseFloat(payroll.basic_salary).toFixed(2)}</td>
<td>₹{parseFloat(payroll.hra || 0).toFixed(2)}</td>
<td>₹{parseFloat(payroll.other_allowances || 0).toFixed(2)}</td>
<td>₹{parseFloat(payroll.other_deductions || 0).toFixed(2)}</td>
                    <td><strong>₹{parseFloat(payroll.net_salary).toFixed(2)}</strong></td>
                    <td>
                      <span className={`status-badge ${payroll.payment_status?.toLowerCase()}`}>
  {payroll.payment_status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
</span>
                    </td>
                    <td>
                      {payroll.payment_status === 'Pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(payroll.id)}
                          className="mark-paid-btn"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayroll;