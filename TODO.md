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

## Followup:

- Test login/logout flow and conditional page navigation.
- Verify "Browse Companions" display and access control.
- Confirm testimonials display on home page.
