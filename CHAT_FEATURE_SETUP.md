# BondMate Chat Feature - Setup Guide

## 🎯 New Features Added:

### 1. **Fixed Pricing & Duration**

- ✅ All bookings are **15 minutes**
- ✅ Fixed price: **₹299 INR**
- ✅ No more custom duration/pricing

### 2. **Real-Time Chat System**

- ✅ Chat between user and companion
- ✅ Only enabled during booking time
- ✅ Auto-disables after 15 minutes
- ✅ Live countdown timer
- ✅ Message history

### 3. **Chat Access Rules**

- ✅ Chat only works for **approved bookings**
- ✅ Enabled from booking start time
- ✅ Disabled 15 minutes after start
- ✅ Polls messages every 3 seconds

---

## 📦 Files Created/Updated:

### **New Backend Files:**

1. `backend/models.py` - Added ChatMessage model, updated Booking
2. `backend/controllers/chat_controller.py` - NEW chat endpoints
3. `backend/controllers/booking_controller.py` - Updated for fixed pricing
4. `backend/controllers/companion_controller.py` - Removed price field
5. `backend/app.py` - Registered chat blueprint

### **New Frontend Files:**

1. `frontend/src/components/ChatWindow.js` - NEW chat component
2. `frontend/src/components/ChatWindow.css` - NEW chat styles
3. `frontend/src/components/Dashboard.js` - Added chat button
4. `frontend/src/components/BookingForm.js` - Simplified for fixed pricing
5. `frontend/src/components/CompanionCard.js` - Updated pricing display

---

## 🔧 Setup Instructions:

### **Step 1: Update Database**

The database schema has changed. You MUST reset the database:

```bash
# Method 1: Drop and recreate (EASIEST)
sudo -u postgres psql
DROP DATABASE bondmate;
CREATE DATABASE bondmate;
GRANT ALL PRIVILEGES ON DATABASE bondmate TO bondmate_user;
\q

# Method 2: Using reset script
./reset_database.sh
```

### **Step 2: Update Backend Files**

Replace/create these files in your `backend/` directory:

1. `models.py` - New ChatMessage model
2. `controllers/chat_controller.py` - NEW FILE
3. `controllers/booking_controller.py` - Updated
4. `controllers/companion_controller.py` - Updated
5. `app.py` - Updated to register chat blueprint

### **Step 3: Update Frontend Files**

Replace/create these files in your `frontend/src/` directory:

1. `components/ChatWindow.js` - NEW FILE
2. `components/ChatWindow.css` - NEW FILE
3. `components/Dashboard.js` - Updated
4. `components/BookingForm.js` - Updated
5. `components/CompanionCard.js` - Updated
6. `components/Dashboard.css` - Updated
7. `components/Forms.css` - Updated

### **Step 4: Restart Services**

```bash
# Stop everything
./stop_all.sh

# Start backend
cd backend
source venv/bin/activate
python3 app.py

# Start frontend (new terminal)
cd frontend
npm start
```

---

## 🎮 How to Use:

### **For Users:**

1. **Browse Companions**

   - View companions with fixed ₹299/15min pricing

2. **Book a Session**

   - Select date/time only
   - Price is automatically ₹299
   - Duration is automatically 15 minutes

3. **Wait for Approval**

   - Admin must approve booking
   - Chat button appears after approval

4. **Start Chatting**

   - Click "💬 Open Chat" button
   - Chat opens in floating window
   - See countdown timer (15:00 → 0:00)
   - Send messages in real-time

5. **Chat Ends**
   - After 15 minutes, chat auto-disables
   - Messages remain visible
   - Cannot send new messages

### **For Companions:**

1. **Create Profile**

   - No price input needed
   - Just add bio and image
   - All sessions are ₹299/15min

2. **View Bookings**

   - See approved bookings
   - Click "💬 Open Chat" during session time
   - Chat with users

3. **Chat During Session**
   - Active only during booking time
   - Real-time messages
   - Auto-closes after 15 minutes

### **For Admin:**

1. **Approve Bookings**

   - Approving enables chat
   - Users and companions can chat during session

2. **View All Bookings**
   - Monitor all sessions
   - See chat status

---

## 🔌 API Endpoints:

### **Chat Endpoints (NEW):**

```
GET  /api/chat/bookings/:id/messages
  - Get all messages for a booking
  - Returns: messages[], chat_enabled, booking

POST /api/chat/bookings/:id/messages
  - Send a message
  - Body: { "message": "text" }
  - Only works during session time

GET  /api/chat/bookings/:id/status
  - Get chat status
  - Returns: chat_enabled, time_remaining, booking times
```

### **Updated Booking Endpoints:**

```
POST /api/bookings
  - Body: { "companion_id": 1, "date": "2024-01-01T10:00:00" }
  - Duration and price are automatic

PUT  /api/bookings/:id/approve
  - Admin only
  - Enables chat for the booking
```

---

## 🎨 UI Features:

### **Chat Window:**

- ✅ Floating window (bottom-right)
- ✅ Live countdown timer
- ✅ Message bubbles (sent/received)
- ✅ Auto-scroll to latest
- ✅ Disabled state after time expires
- ✅ Smooth animations

### **Dashboard:**

- ✅ "💬 Open Chat" button for approved bookings
- ✅ Pricing info: "₹299 - 15 minutes"
- ✅ Chat enabled indicator

### **Booking Form:**

- ✅ Simplified (only date/time)
- ✅ Info box showing ₹299/15min
- ✅ Chat availability notice

---

## ⏱️ Chat Time Logic:

```
Booking Start: 10:00 AM
Chat Enabled: 10:00 AM → 10:15 AM (15 minutes)
Chat Disabled: After 10:15 AM

During the 15-minute window:
- Both user and companion can send messages
- Timer shows remaining time
- Messages are saved

After 15 minutes:
- Chat input disabled
- "Chat Disabled" notice shown
- Message history still visible
- No new messages allowed
```

---

## 🧪 Testing the Feature:

### **Test Flow:**

1. **Create accounts:**

   - User account
   - Companion account
   - Admin account

2. **Companion creates profile:**

   - Just bio and image
   - No price input

3. **User books session:**

   - Select future date/time
   - Sees ₹299/15min info

4. **Admin approves:**

   - Login as admin
   - Approve the booking

5. **Test chat (at booking time):**

   - User opens chat
   - Companion opens chat
   - Both send messages
   - See real-time updates

6. **Test expiry:**
   - Wait 15 minutes
   - Chat auto-disables
   - Verify no new messages allowed

---

## 🐛 Troubleshooting:

### **Issue: Chat button not showing**

**Solution:** Check if booking is approved and it's the right time

### **Issue: Chat disabled immediately**

**Solution:** Make sure booking date/time is current or future

### **Issue: Messages not appearing**

**Solution:** Check browser console, verify token, check backend logs

### **Issue: Database error**

**Solution:** Drop and recreate database (schema changed)

### **Issue: ChatWindow import error**

**Solution:** Make sure ChatWindow.js and ChatWindow.css are created

---

## 📊 Database Changes:

### **New Table: chat_messages**

```sql
- id (Primary Key)
- booking_id (Foreign Key → bookings)
- sender_id (Foreign Key → users)
- message (Text)
- created_at (Timestamp)
```

### **Updated Table: bookings**

```sql
- duration: Default 15 (fixed)
- price: Default 299 (fixed)
- status: Added 'completed'
- chat_enabled: Boolean (NEW)
- Removed: city field
```

### **Updated Table: companions**

```sql
- Removed: price_per_hour field
```

---

## 🚀 Production Considerations:

For production deployment, consider:

1. **WebSockets** for real-time chat (instead of polling)
2. **Message pagination** for long conversations
3. **File/image sharing** in chat
4. **Typing indicators**
5. **Read receipts**
6. **Push notifications**
7. **Chat encryption**
8. **Message moderation**

---

## ✅ Success Indicators:

Installation successful when:

- ✅ Database recreated without errors
- ✅ Backend starts without errors
- ✅ Frontend shows ₹299 pricing
- ✅ Booking form only asks for date/time
- ✅ Chat button appears on approved bookings
- ✅ Chat window opens and closes
- ✅ Messages send and receive
- ✅ Timer counts down
- ✅ Chat disables after 15 minutes

---

**Happy Chatting! 💬**
