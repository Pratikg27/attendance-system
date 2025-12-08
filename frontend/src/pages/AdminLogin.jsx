import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Admin Login Submitted:', formData);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: 'admin'
      });

      console.log('✅ Login Response:', response.data);

      if (response.data.token) {
        // Store authentication data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'admin');
        
        console.log('✅ Token stored:', localStorage.getItem('token'));
        console.log('✅ User stored:', localStorage.getItem('user'));
        console.log('✅ UserType stored:', localStorage.getItem('userType'));
        
        alert('Login successful!');

// ✅ Navigate directly without setTimeout
navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🔐 Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter admin email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="back-link" onClick={() => navigate('/')}>← Back to Home</p>
      </div>
    </div>
  );
};

export default AdminLogin;