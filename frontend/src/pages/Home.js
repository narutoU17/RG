import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      // Redirect logged-in users to dashboard
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">BondMate</div>
        <div className="nav-links">
          {token && (
            <>
              <button onClick={() => navigate('/companions')} className="nav-link">
                Browse Companions
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Dashboard
              </button>
            </>
          )}
          {!token && (
            <>
              <button onClick={() => navigate('/login')} className="btn-secondary">
                Login
              </button>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="hero-section">
        <h1>Welcome to BondMate</h1>
        <p className="hero-subtitle">Your Trusted Companion Booking Platform</p>
        <p className="hero-description">
          Find genuine companions for emotional support, social events, and meaningful conversations. 
          All interactions are strictly platonic and professional.
        </p>
        <div className="hero-actions">
          {token ? (
            <button onClick={() => navigate('/companions')} className="btn-primary btn-large">
              Browse Companions
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/companions')} className="btn-primary btn-large">
                Browse Companions
              </button>
              <button onClick={() => navigate('/signup')} className="btn-secondary btn-large">
                Join as Companion
              </button>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose BondMate?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Verified Companions</h3>
            <p>All companions are verified and committed to providing quality companionship</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Safe & Secure</h3>
            <p>Admin-approved bookings ensure safety and professionalism</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Platonic Only</h3>
            <p>Strictly emotional and social companionship services</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rated Experience</h3>
            <p>Choose companions based on ratings and reviews</p>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-comment">"BondMate helped me find a great companion for social events. Highly recommend!"</p>
            <p className="testimonial-name">- Alice Johnson</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-comment">"Professional and safe platform. The companions are friendly and verified."</p>
            <p className="testimonial-name">- Michael Smith</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-comment">"Excellent service with great support. I felt comfortable finding companionship here."</p>
            <p className="testimonial-name">- Emily Davis</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 BondMate. All rights reserved.</p>
        <p className="footer-disclaimer">
          BondMate provides strictly platonic companionship services. 
          We do not facilitate any adult or romantic services.
        </p>
      </footer>
    </div>
  );
}

export default Home;