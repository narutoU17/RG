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
    interests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    companion_profile = db.relationship('Companion', backref='user', uselist=False, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', foreign_keys='Booking.user_id', backref='user', cascade='all, delete-orphan')
    sent_messages = db.relationship('ChatMessage', foreign_keys='ChatMessage.sender_id', backref='sender', cascade='all, delete-orphan')
    
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
    rating = db.Column(db.Float, default=0.0)
    image_url = db.Column(db.String(500))
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
    duration = db.Column(db.Integer, default=15, nullable=False)  # Fixed 15 minutes
    price = db.Column(db.Integer, default=299, nullable=False)  # Fixed ₹299
    status = db.Column(db.Enum('pending', 'approved', 'rejected', 'completed', name='booking_status'), default='pending', nullable=False)
    chat_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='booking', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'companion_id': self.companion_id,
            'companion_name': self.companion.user.name if self.companion and self.companion.user else None,
            'date': self.date.isoformat() if self.date else None,
            'duration': self.duration,
            'price': self.price,
            'status': self.status,
            'chat_enabled': self.chat_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name if self.sender else None,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }