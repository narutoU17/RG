import React, { useState } from 'react';
import { createBooking } from '../api';
import './Forms.css';

function BookingForm({ companionId, onSuccess }) {
  const [formData, setFormData] = useState({
    companion_id: companionId,
    date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await createBooking(formData);
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        companion_id: companionId,
        date: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h3>Book This Companion</h3>
      
      <div className="booking-info-box">
        <h4>📋 Session Details:</h4>
        <p><strong>Duration:</strong> 15 minutes</p>
        <p><strong>Price:</strong> ₹299</p>
        <p className="info-note">💬 Chat will be enabled during your session time</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Booking request submitted successfully! Waiting for admin approval.</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          <small>Choose when you want to start your 15-minute session</small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking Request (₹299)'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;