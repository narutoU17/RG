import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanion } from '../api';
import BookingForm from '../components/BookingForm';
import './Pages.css';

function Booking() {
  const { companionId } = useParams();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanion();
  }, [companionId]);

  const fetchCompanion = async () => {
    try {
      const response = await getCompanion(companionId);
      setCompanion(response.data.companion);
    } catch (err) {
      setError('Failed to load companion details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (loading) return <div className="booking-container">Loading...</div>;
  if (error) return <div className="booking-container error-message">{error}</div>;
  if (!companion) return <div className="booking-container">Companion not found</div>;

  return (
    <div className="booking-container">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>BondMate</div>
        <div className="nav-links">
          <button onClick={() => navigate('/companions')} className="nav-link">
            Back to Companions
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Dashboard
          </button>
        </div>
      </nav>

      <div className="booking-content">
        <div className="companion-preview">
          <h2>Booking Companion</h2>
          {companion.image_url ? (
            <img src={companion.image_url} alt={companion.name} className="companion-preview-image" />
          ) : (
            <div className="companion-preview-placeholder">
              <span>{companion.name?.charAt(0)}</span>
            </div>
          )}
          <h3>{companion.name}</h3>
          <p>📍 {companion.city}</p>
          <p>Age: {companion.age}</p>
          <p className="companion-bio">{companion.bio}</p>
          <div className="price-info">
            <strong>${companion.price_per_hour}/hour</strong>
          </div>
          <div className="rating-info">
            ⭐ {companion.rating}/5
          </div>
        </div>

        <div className="booking-form-container">
          <BookingForm 
            companionId={parseInt(companionId)} 
            onSuccess={handleBookingSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default Booking;