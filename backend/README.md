# BondMate Backend

Flask REST API for the BondMate companion booking platform.

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```bash
psql -U postgres
CREATE DATABASE bondmate;
\q
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Environment Variables (Optional)

Create a `.env` file:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/bondmate
JWT_SECRET_KEY=your-super-secret-jwt-key
```

### 5. Run the Application

```bash
python app.py
```

The API will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Users

- `GET /api/users/profile` - Get current user profile (JWT required)
- `PUT /api/users/profile` - Update user profile (JWT required)

### Companions

- `GET /api/companions` - List all available companions
- `GET /api/companions/:id` - Get companion details
- `POST /api/companions` - Create companion profile (Companion role, JWT required)
- `PUT /api/companions/:id` - Update companion profile (JWT required)
- `DELETE /api/companions/:id` - Delete companion profile (JWT required)

### Bookings

- `GET /api/bookings` - Get user's bookings (JWT required)
- `GET /api/bookings/all` - Get all bookings (Admin only, JWT required)
- `POST /api/bookings` - Create booking request (JWT required)
- `PUT /api/bookings/:id/approve` - Approve booking (Admin only, JWT required)
- `PUT /api/bookings/:id/reject` - Reject booking (Admin only, JWT required)
- `DELETE /api/bookings/:id` - Cancel booking (JWT required)

## Database Schema

### users

- id, name, email, password, role (user/companion/admin), city, age, created_at

### companions

- id, user_id (FK), bio, price_per_hour, rating, image_url, availability, created_at

### bookings

- id, user_id (FK), companion_id (FK), date, duration, city, status (pending/approved/rejected), created_at

## User Roles

- **user**: Regular users who can browse companions and make bookings
- **companion**: Users who offer companion services and manage their profiles
- **admin**: Administrative users who can approve/reject bookings

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```
