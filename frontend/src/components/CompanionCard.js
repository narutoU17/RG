import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanionCard.css';

function CompanionCard({ companion }) {
  const navigate = useNavigate();

  const handleBook = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is a companion
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'companion') {
      alert('Companions cannot book other companions.');
      return;
    }

    navigate(`/booking/${companion.id}`);
  };

  return (
    <div className="companion-card">
      <div className="companion-image">
        {companion.image_url ? (
          <img src={companion.image_url} alt={companion.name} />
        ) : (
          <div className="placeholder-image">
            <span>{companion.name?.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="companion-details">
        <h3>{companion.name}</h3>
        <p className="companion-location">📍 {companion.district}, {companion.state}</p>
        <p className="companion-age">Age: {companion.age}</p>
        {companion.interests && (
          <p className="companion-interests">
            <strong>Interests:</strong> {companion.interests}
          </p>
        )}
        <p className="companion-bio">{companion.bio || 'No bio available'}</p>
        
        <div className="companion-footer">
          <div className="companion-price">
            <span className="price-label">Session Price:</span>
            <span className="price-value">₹299</span>
            <span className="price-duration">15 minutes</span>
          </div>
          <div className="companion-rating">
            ⭐ {companion.rating || 0}/5
          </div>
        </div>

        <button onClick={handleBook} className="btn-book">
          Book Now
        </button>
      </div>
    </div>
  );
}

export default CompanionCard;