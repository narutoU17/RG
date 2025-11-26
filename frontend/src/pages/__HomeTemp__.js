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
      {/* Additional content... */}
    </div>
  );
}

export default Home;
