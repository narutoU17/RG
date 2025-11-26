import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api';
import { getStates, getDistricts } from '../data/indiaStates';
import './Forms.css';

function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    state: '',
    district: '',
    age: '',
    interests: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

  const states = getStates();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // When state changes, update districts
    if (name === 'state') {
      setDistricts(getDistricts(value));
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signup(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Sign Up for BondMate</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User (Book Companions)</option>
              <option value="companion">Companion (Offer Services)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>State</label>
            <select 
              name="state" 
              value={formData.state} 
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>District</label>
            <select 
              name="district" 
              value={formData.district} 
              onChange={handleChange}
              required
              disabled={!formData.state}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
              min="18"
            />
          </div>

          <div className="form-group">
            <label>Interests (comma separated)</label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g., Music, Sports, Movies, Travel"
            />
            <small>Enter your interests separated by commas</small>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;