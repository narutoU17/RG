from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from flask_socketio import emit, join_room, leave_room
from database import db
from models import Message, Booking, User
from utils.jwt_handler import get_current_user_id
from app import socketio

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@chat_bp.route('/messages/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_messages(booking_id):
    """Get all messages for a booking"""
    try:
        user_id = get_current_user_id()
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user is part of the booking
        if booking.user_id != user_id and booking.companion.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        messages = Message.query.filter_by(booking_id=booking_id).order_by(Message.timestamp).all()
        return jsonify({'messages': [msg.to_dict() for msg in messages]}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/messages/<int:booking_id>', methods=['POST'])
@jwt_required()
def send_message(booking_id):
    """Send a message in a booking chat"""
    try:
        user_id = get_current_user_id()
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user is part of the booking
        if booking.user_id != user_id and booking.companion.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check if booking is active (approved and within time)
        if booking.status != 'approved':
            return jsonify({'error': 'Chat is only available for approved bookings'}), 403
        
        from datetime import datetime, timedelta
        booking_end = booking.date + timedelta(hours=booking.duration)
        if datetime.utcnow() > booking_end:
            return jsonify({'error': 'Booking time has ended'}), 403
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        new_message = Message(
            booking_id=booking_id,
            sender_id=user_id,
            message=data['message']
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        # Emit to socket room
        socketio.emit('message', new_message.to_dict(), room=f'booking_{booking_id}')
        
        return jsonify({'message': new_message.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# SocketIO events
@socketio.on('join_booking')
def handle_join_booking(data):
    """Join a booking chat room"""
    booking_id = data.get('booking_id')
    join_room(f'booking_{booking_id}')
    emit('joined', {'booking_id': booking_id})

@socketio.on('leave_booking')
def handle_leave_booking(data):
    """Leave a booking chat room"""
    booking_id = data.get('booking_id')
    leave_room(f'booking_{booking_id}')
    emit('left', {'booking_id': booking_id})
