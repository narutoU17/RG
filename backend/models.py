from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('user', 'companion', 'admin', name='user_roles'), default='user', nullable=False)
    state = db.Column(db.String(100))
    district = db.Column(db.String(100))
    age = db.Column(db.Integer)
    interests = db.Column(db.Text)  # Comma-separated interests
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    companion_profile = db.relationship('Companion', backref='user', uselist=False, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', foreign_keys='Booking.user_id', backref='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'state': self.state,
            'district': self.district,
            'age': self.age,
            'interests': self.interests,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Companion(db.Model):
    __tablename__ = 'companions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    bio = db.Column(db.Text)
    price_per_hour = db.Column(db.Numeric(10, 2), nullable=False)
    rating = db.Column(db.Float, default=0.0)
    image_url = db.Column(db.String(500))  # Back to image_url
    availability = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    bookings = db.relationship('Booking', foreign_keys='Booking.companion_id', backref='companion', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None,
            'state': self.user.state if self.user else None,
            'district': self.user.district if self.user else None,
            'age': self.user.age if self.user else None,
            'interests': self.user.interests if self.user else None,
            'bio': self.bio,
            'price_per_hour': float(self.price_per_hour) if self.price_per_hour else 0,
            'rating': self.rating,
            'image_url': self.image_url,
            'availability': self.availability,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    companion_id = db.Column(db.Integer, db.ForeignKey('companions.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in hours
    city = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', name='booking_status'), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'companion_id': self.companion_id,
            'companion_name': self.companion.user.name if self.companion and self.companion.user else None,
            'date': self.date.isoformat() if self.date else None,
            'duration': self.duration,
            'city': self.city,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }