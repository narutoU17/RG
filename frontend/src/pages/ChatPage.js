import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

function ChatPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchApprovedBookings(parsedUser.role);
  }, [navigate]);

  const fetchApprovedBookings = async (role) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = role === 'admin'
        ? await axios.get('http://localhost:5000/api/bookings/all', {
            headers: { Authorization: `Bearer ${token}` }
          })
        : await axios.get('http://localhost:5000/api/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          });

      // Filter only approved bookings
      const approvedBookings = response.data.bookings.filter(booking => booking.status === 'approved');
      setBookings(approvedBookings);

      // Auto-select first chat if available
      if (approvedBookings.length > 0) {
        setSelectedBookingId(approvedBookings[0].id);
      }
    } catch (err) {
      console.error('Failed to load approved bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  const getChatPartnerName = (booking) => {
    if (user?.role === 'user') {
      return booking.companion_name;
    } else if (user?.role === 'companion') {
      return booking.user_name;
    } else {
      // Admin
      return user?.role === 'user' ? booking.companion_name : booking.user_name;
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-loading">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Chats</h2>
        </div>
        <div className="chat-list">
          {bookings.length === 0 ? (
            <div className="no-chats">
              <p>No approved bookings to chat with.</p>
            </div>
          ) : (
            bookings.map(booking => (
              <div
                key={booking.id}
                className={`chat-item ${selectedBookingId === booking.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(booking.id)}
              >
                <div className="chat-avatar">
                  <div className="avatar-circle">
                    {getChatPartnerName(booking).charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="chat-info">
                  <div className="chat-name">{getChatPartnerName(booking)}</div>
                  <div className="chat-last-message">
                    Booking #{booking.id} • {new Date(booking.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="chat-status">
                  <div className="status-dot"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedBookingId ? (
          <ChatWindow
            bookingId={selectedBookingId}
            onClose={() => setSelectedBookingId(null)}
            isFullPage={true}
          />
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">💬</div>
              <h3>Select a chat to start messaging</h3>
              <p>Choose a conversation from the sidebar to begin chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
