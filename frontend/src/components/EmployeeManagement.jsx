import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/EmployeeManagement.css';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    join_date: new Date().toISOString().split('T')[0]
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL + '/admin/employees', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      employee_code: '',
      name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      designation: '',
      salary: '',
      join_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setFormData({
      employee_code: employee.employee_code,
      name: employee.name,
      email: employee.email,
      password: '',
      phone: employee.phone || '',
      department: employee.department || '',
      designation: employee.designation || '',
      salary: employee.salary || '',
      join_date: employee.join_date ? new Date(employee.join_date).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.employee_code) {
      alert('Please fill all required fields');
      return;
    }

    if (modalMode === 'add' && !formData.password) {
      alert('Password is required for new employees');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_URL + '/admin/employees',
        formData,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      alert('Employee added successfully!');
      closeModal();
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = { ...formData };
      
      if (!updateData.password) {
        delete updateData.password;
      }

      await axios.put(
        API_URL + '/admin/employees/' + selectedEmployee.employee_id,
        updateData,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      alert('Employee updated successfully!');
      closeModal();
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    const confirmed = window.confirm('Are you sure you want to delete ' + employeeName + '?');
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        API_URL + '/admin/employees/' + employeeId,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      alert('Employee deleted successfully!');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="employee-management">
      <div className="em-header">
        <h1>👥 Employee Management</h1>
        <button onClick={openAddModal} className="btn-add-employee">
          ➕ Add New Employee
        </button>
      </div>

      <div className="em-search">
        <input
          type="text"
          placeholder="🔍 Search by name, email, code, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="em-stats">
        <div className="stat-card">
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{employees.filter(e => e.is_active).length}</div>
          <div className="stat-label">Active Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredEmployees.length}</div>
          <div className="stat-label">Search Results</div>
        </div>
      </div>

      <div className="em-table-container">
        {filteredEmployees.length === 0 ? (
          <div className="no-data">
            <p>No employees found</p>
          </div>
        ) : (
          <table className="em-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.employee_id}>
                  <td><strong>{employee.employee_code}</strong></td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone || '-'}</td>
                  <td>{employee.department || '-'}</td>
                  <td>{employee.designation || '-'}</td>
                  <td>₹{employee.salary ? Number(employee.salary).toLocaleString() : '-'}</td>
                  <td>{employee.join_date ? new Date(employee.join_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={'status-badge ' + (employee.is_active ? 'active' : 'inactive')}>
                      {employee.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="btn-edit"
                        title="Edit Employee"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.employee_id, employee.name)}
                        className="btn-delete"
                        title="Delete Employee"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? '➕ Add New Employee' : '✏️ Edit Employee'}</h2>
              <button onClick={closeModal} className="modal-close">✖</button>
            </div>

            <form onSubmit={modalMode === 'add' ? handleAddEmployee : handleUpdateEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee Code *</label>
                  <input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password {modalMode === 'add' ? '*' : '(Leave blank to keep current)'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={modalMode === 'add'}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Salary (₹)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === 'add' ? '➕ Add Employee' : '💾 Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;