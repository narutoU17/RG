# TODO: Improve UI & Navigation Flow for BondMate

## Tasks

- [ ] 1. Protect "/companions" route in frontend/src/App.js to allow only logged-in users.
- [ ] 2. Update frontend/src/pages/Home.js:
  - Show "Browse Companions" buttons and nav only if logged in.
  - Add testimonials section to the home page.
  - Redirect logged-in users from "/" to "/dashboard".
- [ ] 3. Update frontend/src/pages/Companions.js:
  - Add redirect or block access if user is not logged in.
- [ ] 4. Update frontend/src/components/Dashboard.js:
  - Ensure "Browse Companions" button shows only if user is logged in.
- [ ] 5. Improve UI styling on Home page and add styling for testimonials.

## Chat Feature Fix - COMPLETED ✅

### Completed Tasks ✅

- [x] Register chat blueprint in app.py
- [x] Fix ChatMessage import in chat_controller.py
- [x] Add /status endpoint to chat controller
- [x] Update get_messages to include chat_enabled and time_remaining
- [x] Uncomment disabled attributes in ChatWindow.js
- [x] Fix send_message to use ChatMessage model
- [x] Test backend starts without errors
- [x] Test frontend compiles without errors

### Issues Found and Fixed

- Chat blueprint not registered in app.py
- Incorrect import of 'Message' instead of 'ChatMessage'
- Missing status endpoint for chat
- Frontend input/button disabled for testing
- Missing time_remaining calculation in responses

## Followup:

- Test login/logout flow and conditional page navigation.
- Verify "Browse Companions" display and access control.
- Confirm testimonials display on home page.
- **Chat Feature**: Test chat functionality with approved bookings
