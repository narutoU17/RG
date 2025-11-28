import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, getAllBookings, approveBooking, rejectBooking, deleteBooking, createCompanion, updateCompanion } from '../api';
import axios from 'axios';
import ChatWindow from './ChatWindow';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companionProfile, setCompanionProfile] = useState(null);
  const [companionForm, setCompanionForm] = useState({
    bio: '',
    image_url: '',
    availability: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchBookings(parsedUser.role);
      if (parsedUser.role === 'companion') {
        fetchCompanionProfile();
      }
    }
  }, []);

  const fetchCompanionProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/companions/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanionProfile(response.data.companion);
      setCompanionForm({
        bio: response.data.companion.bio || '',
        image_url: response.data.companion.image_url || '',
        availability: response.data.companion.availability
      });
      setIsEditing(true);
    } catch (err) {
      // Profile doesn't exist yet
      console.log('No companion profile found');
    }
  };

  const fetchBookings = async (role) => {
    try {
      const response = role === 'admin' ? await getAllBookings() : await getBookings();
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleApprove = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      fetchBookings(user.role);
    } catch (err) {
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      fetchBookings(user.role);
    } catch (err) {
      alert('Failed to reject booking');
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(bookingId);
        fetchBookings(user.role);
      } catch (err) {
        alert('Failed to delete booking');
      }
    }
  };

  const handleCompanionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && companionProfile) {
        // Update existing profile
        await updateCompanion(companionProfile.id, companionForm);
        alert('Companion profile updated successfully!');
      } else {
        // Create new profile
        await createCompanion(companionForm);
        alert('Companion profile created successfully!');
        setIsEditing(true);
      }
      
      fetchCompanionProfile();
    } catch (err) {
      console.error('Error saving companion profile:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to save companion profile');
    }
  };

  const handleCompanionChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCompanionForm({
      ...companionForm,
      [e.target.name]: value
    });
  };

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          {user?.role !== 'companion' && (
            <button onClick={() => navigate('/companions')} className="btn-secondary">
              Browse Companions
            </button>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="user-info">
        <h2>Welcome, {user?.name}!</h2>
        <p>Role: <strong>{user?.role}</strong></p>
        <p>Email: {user?.email}</p>
        <p>Location: {user?.district}, {user?.state}</p>
        {user?.interests && (
          <p>Interests: <strong>{user.interests}</strong></p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Companion Profile Creation */}
      {user?.role === 'companion' && (
        <div className="companion-profile-section">
          <h3>{isEditing ? 'Update Your Companion Profile' : 'Create Your Companion Profile'}</h3>
          
          {companionProfile && (
            <div className="current-profile">
              <h4>Current Profile:</h4>
              <p><strong>Bio:</strong> {companionProfile.bio}</p>
              <p><strong>Status:</strong> {companionProfile.availability ? 'Available' : 'Unavailable'}</p>
              <p className="pricing-info">💰 All sessions are 15 minutes at ₹299</p>
              {companionProfile.image_url && (
                <div className="profile-image-preview">
                  <img src={companionProfile.image_url} alt="Profile" />
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCompanionSubmit} className="companion-form">
            <div className="pricing-notice">
              <strong>📌 Standard Pricing:</strong> All sessions are 15 minutes at ₹299
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={companionForm.bio}
                onChange={handleCompanionChange}
                placeholder="Tell about yourself"
                rows="4"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image_url"
                value={companionForm.image_url}
                onChange={handleCompanionChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="availability"
                  checked={companionForm.availability}
                  onChange={handleCompanionChange}
                />
                Available for bookings
              </label>
            </div>
            
            <button type="submit" className="btn-primary">
              {isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Bookings Section */}
      <div className="bookings-section">
        <h3>{user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}</h3>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className={`booking-card status-${booking.status}`}>
                <div className="booking-info">
                  <h4>Booking #{booking.id}</h4>
                  <p><strong>User:</strong> {booking.user_name}</p>
                  <p><strong>Companion:</strong> {booking.companion_name}</p>
                  <p><strong>Date:</strong> {new Date(booking.date).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {booking.duration} minutes</p>
                  <p><strong>Price:</strong> ₹{booking.price}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${booking.status}`}>{booking.status}</span></p>
                </div>
                <div className="booking-actions">
                  {booking.status === 'approved' && (
                    <button 
                      onClick={() => setActiveChatBookingId(booking.id)} 
                      className="btn-chat"
                    >
                      💬 Open Chat
                    </button>
                  )}
                  {user?.role === 'admin' && booking.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(booking.id)} className="btn-approve">
                        Approve
                      </button>
                      <button onClick={() => handleReject(booking.id)} className="btn-reject">
                        Reject
                      </button>
                    </>
                  )}
                  {(user?.role === 'user' || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(booking.id)} className="btn-delete">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {activeChatBookingId && (
        <ChatWindow 
          bookingId={activeChatBookingId}
          onClose={() => setActiveChatBookingId(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;