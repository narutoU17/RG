import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanions } from '../api';
import CompanionCard from '../components/CompanionCard';
import './Pages.css';

function Companions() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ state: '', district: '', minPrice: '', maxPrice: '' });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is a companion trying to access this page
      if (parsedUser.role === 'companion') {
        alert('Companions cannot book other companions. This page is for users only.');
        navigate('/dashboard');
        return;
      }
    }
    
    fetchCompanions();
  }, [navigate]);

  const fetchCompanions = async () => {
    try {
      const response = await getCompanions();
      setCompanions(response.data.companions);
    } catch (err) {
      setError('Failed to load companions');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanions = companions.filter(companion => {
    // Filter by state
    if (filter.state && !companion.state?.toLowerCase().includes(filter.state.toLowerCase())) {
      return false;
    }
    // Filter by district
    if (filter.district && !companion.district?.toLowerCase().includes(filter.district.toLowerCase())) {
      return false;
    }
    // Filter by min price
    if (filter.minPrice && companion.price_per_hour < parseFloat(filter.minPrice)) {
      return false;
    }
    // Filter by max price
    if (filter.maxPrice && companion.price_per_hour > parseFloat(filter.maxPrice)) {
      return false;
    }
    return true;
  });

  // Filter companions by user interests if logged in
  const interestFilteredCompanions = user?.interests 
    ? filteredCompanions.filter(companion => {
        if (!companion.interests) return true;
        const userInterests = user.interests.split(',').map(i => i.trim().toLowerCase());
        const companionInterests = companion.interests.split(',').map(i => i.trim().toLowerCase());
        return userInterests.some(interest => companionInterests.includes(interest));
      })
    : filteredCompanions;

  return (
    <div className="companions-container">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>BondMate</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-link">Home</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Dashboard</button>
        </div>
      </nav>

      <div className="companions-header">
        <h1>Browse Companions</h1>
        <p>Find the perfect companion for your needs</p>
        {user?.interests && (
          <p className="interest-note">
            Showing companions matching your interests: <strong>{user.interests}</strong>
          </p>
        )}
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Filter by state"
          value={filter.state}
          onChange={(e) => setFilter({ ...filter, state: e.target.value })}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter by district"
          value={filter.district}
          onChange={(e) => setFilter({ ...filter, district: e.target.value })}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Min price"
          value={filter.minPrice}
          onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filter.maxPrice}
          onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
          className="filter-input"
        />
      </div>

      {loading && <div className="loading">Loading companions...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="companions-grid">
        {interestFilteredCompanions.length === 0 ? (
          <p className="no-companions">No companions found matching your criteria.</p>
        ) : (
          interestFilteredCompanions.map(companion => (
            <CompanionCard key={companion.id} companion={companion} />
          ))
        )}
      </div>
    </div>
  );
}

export default Companions;