import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow({ bookingId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatEnabled, setChatEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchMessages();
    checkChatStatus();

    // Poll for new messages every 3 seconds
    const messageInterval = setInterval(fetchMessages, 3000);
    
    // Check chat status every second
    const statusInterval = setInterval(checkChatStatus, 1000);
    
    intervalRef.current = { messageInterval, statusInterval };

    return () => {
      clearInterval(messageInterval);
      clearInterval(statusInterval);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/bookings/${bookingId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages);
      setChatEnabled(response.data.chat_enabled);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const checkChatStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/bookings/${bookingId}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatEnabled(response.data.chat_enabled);
      setTimeRemaining(response.data.time_remaining);
    } catch (error) {
      console.error('Error checking chat status:', error);
    }
  };

  const handleSendMessage = async (e) => {
    console.log("clicked")
    e.preventDefault();
    if (!newMessage.trim() || !chatEnabled) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/chat/bookings/${bookingId}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send message');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>Loading chat...</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <h3>Chat - Booking #{bookingId}</h3>
          {chatEnabled ? (
            <span className="timer">⏱️ {formatTime(timeRemaining)} remaining</span>
          ) : (
            <span className="timer expired">Chat Disabled</span>
          )}
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === currentUser?.id ? 'sent' : 'received'}`}
            >
              <div className="message-header">
                <span className="sender-name">{msg.sender_name}</span>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={chatEnabled ? "Type your message..." : "Chat is disabled"}
        //   disabled={!chatEnabled}
          className="message-input"
        />
        <button
          type="submit"
        //   disabled={!chatEnabled || !newMessage.trim()}
          className="send-btn"
        >
          Send
        </button>
      </form>

      {!chatEnabled && (
        <div className="chat-disabled-notice">
          ⚠️ Chat is only available during your 15-minute booking session
        </div>
      )}
    </div>
  );
}

export default ChatWindow;