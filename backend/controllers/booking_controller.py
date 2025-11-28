from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import Booking, Companion
from utils.jwt_handler import get_current_user_id
from datetime import datetime

booking_bp = Blueprint('booking', __name__, url_prefix='/api/bookings')

@booking_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    """Get current user's bookings"""
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        role = claims.get('role')
        
        # If companion, get bookings where they are the companion
        if role == 'companion':
            companion = Companion.query.filter_by(user_id=user_id).first()
            if companion:
                bookings = Booking.query.filter_by(companion_id=companion.id).all()
            else:
                bookings = []
        else:
            # If user, get their bookings
            bookings = Booking.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@booking_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_bookings():
    """Get all bookings (admin only)"""
    try:
        claims = get_jwt()
        
        # Check if user is admin
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        bookings = Booking.query.all()
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@booking_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking request (15 min, ₹299)"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        # Validate required fields (only companion_id and date needed now)
        required_fields = ['companion_id', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if companion exists
        companion = Companion.query.get(data['companion_id'])
        if not companion:
            return jsonify({'error': 'Companion not found'}), 404
        
        # Check if companion is available
        if not companion.availability:
            return jsonify({'error': 'Companion is not available'}), 400
        
        # Parse date
        try:
            booking_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except:
            return jsonify({'error': 'Invalid date format. Use ISO format'}), 400
        
        # Create booking with fixed duration (15 min) and price (₹299)
        new_booking = Booking(
            user_id=user_id,
            companion_id=data['companion_id'],
            date=booking_date,
            duration=15,  # Fixed 15 minutes
            price=299,    # Fixed ₹299
            status='pending'
        )
        
        db.session.add(new_booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking request created successfully (15 min session - ₹299)',
            'booking': new_booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@booking_bp.route('/<int:booking_id>/approve', methods=['PUT'])
@jwt_required()
def approve_booking(booking_id):
    """Approve a booking (admin only) - enables chat"""
    try:
        claims = get_jwt()
        
        # Check if user is admin
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking.status = 'approved'
        booking.chat_enabled = True  # Enable chat when approved
        db.session.commit()
        
        return jsonify({
            'message': 'Booking approved successfully - Chat enabled',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@booking_bp.route('/<int:booking_id>/reject', methods=['PUT'])
@jwt_required()
def reject_booking(booking_id):
    """Reject a booking (admin only)"""
    try:
        claims = get_jwt()
        
        # Check if user is admin
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking.status = 'rejected'
        db.session.commit()
        
        return jsonify({
            'message': 'Booking rejected successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@booking_bp.route('/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def delete_booking(booking_id):
    """Cancel/delete a booking"""
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user owns this booking or is admin
        if booking.user_id != user_id and claims.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized to delete this booking'}), 403
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({'message': 'Booking deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500