import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api';
import './Pages.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    age: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name,
        city: response.data.user.city || '',
        age: response.data.user.age || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile(formData);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>BondMate</div>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Dashboard
          </button>
        </div>
      </nav>

      <div className="profile-content">
        <h1>My Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;