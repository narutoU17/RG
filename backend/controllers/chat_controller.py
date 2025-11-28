from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import ChatMessage, Booking, User
from utils.jwt_handler import get_current_user_id
from functools import wraps

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

def jwt_optional(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
        return jwt_required()(fn)(*args, **kwargs)
    return wrapper

@chat_bp.route('/bookings/<int:booking_id>/messages', methods=['GET'])
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
        
        messages = ChatMessage.query.filter_by(booking_id=booking_id).order_by(ChatMessage.created_at).all()

        # Calculate time remaining
        from datetime import datetime, timedelta
        booking_end = booking.date + timedelta(minutes=booking.duration)
        current_time = datetime.utcnow()
        time_remaining = max(0, int((booking_end - current_time).total_seconds()))

        return jsonify({
            'messages': [msg.to_dict() for msg in messages],
            'chat_enabled': booking.chat_enabled and booking.status == 'approved' and current_time <= booking_end,
            'time_remaining': time_remaining,
            'booking': booking.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/bookings/<int:booking_id>/messages', methods=['POST'])
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
        booking_end = booking.date + timedelta(minutes=booking.duration)
        if datetime.utcnow() > booking_end:
            return jsonify({'error': 'Booking time has ended'}), 403
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        new_message = ChatMessage(
            booking_id=booking_id,
            sender_id=user_id,
            message=data['message']
        )
        
        db.session.add(new_message)
        db.session.commit()

        return jsonify({'message': new_message.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/bookings/<int:booking_id>/status', methods=['GET'])
@jwt_required()
def get_chat_status(booking_id):
    """Get chat status for a booking"""
    try:
        user_id = get_current_user_id()
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        # Check if user is part of the booking
        if booking.user_id != user_id and booking.companion.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Calculate time remaining
        from datetime import datetime, timedelta
        booking_end = booking.date + timedelta(minutes=booking.duration)
        current_time = datetime.utcnow()
        time_remaining = max(0, int((booking_end - current_time).total_seconds()))

        return jsonify({
            'chat_enabled': booking.chat_enabled and booking.status == 'approved' and current_time <= booking_end,
            'time_remaining': time_remaining,
            'booking': booking.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
