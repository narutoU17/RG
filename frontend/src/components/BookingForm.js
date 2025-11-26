import React, { useState } from 'react';
import { createBooking } from '../api';
import './Forms.css';

function BookingForm({ companionId, onSuccess }) {
  const [formData, setFormData] = useState({
    companion_id: companionId,
    date: '',
    duration: 1,
    city: ''
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
        date: '',
        duration: 1,
        city: ''
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
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Booking request submitted successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Duration (hours)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="24"
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
            required
            placeholder="Enter city"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;