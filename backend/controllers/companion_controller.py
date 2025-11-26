from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import Companion, User
from utils.jwt_handler import get_current_user_id

companion_bp = Blueprint('companion', __name__, url_prefix='/api/companions')


@companion_bp.route('', methods=['GET'])
def get_companions():
    """Get all companions (public endpoint) with optional interest filtering"""
    try:
        interests = request.args.get('interests', '')
        
        companions = Companion.query.filter_by(availability=True).all()
        
        # Filter by interests if provided
        if interests:
            interest_list = [i.strip().lower() for i in interests.split(',')]
            filtered_companions = []
            for companion in companions:
                if companion.user and companion.user.interests:
                    companion_interests = [i.strip().lower() for i in companion.user.interests.split(',')]
                    # Check if any interest matches
                    if any(interest in companion_interests for interest in interest_list):
                        filtered_companions.append(companion)
            companions = filtered_companions
        
        return jsonify({
            'companions': [companion.to_dict() for companion in companions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@companion_bp.route('/<int:companion_id>', methods=['GET'])
def get_companion(companion_id):
    """Get companion details by ID"""
    try:
        companion = Companion.query.get(companion_id)
        
        if not companion:
            return jsonify({'error': 'Companion not found'}), 404
        
        return jsonify({'companion': companion.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@companion_bp.route('/my-profile', methods=['GET'])
@jwt_required()
def get_my_companion_profile():
    """Get current user's companion profile"""
    try:
        user_id = get_current_user_id()
        companion = Companion.query.filter_by(user_id=user_id).first()
        
        if not companion:
            return jsonify({'error': 'Companion profile not found'}), 404
        
        return jsonify({'companion': companion.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@companion_bp.route('', methods=['POST'])
@jwt_required()
def create_companion():
    """Create companion profile (companion role only)"""
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        
        # Check if user has companion role
        if claims.get('role') != 'companion':
            return jsonify({'error': 'Only companions can create profiles'}), 403
        
        # Check if companion profile already exists
        if Companion.query.filter_by(user_id=user_id).first():
            return jsonify({'error': 'Companion profile already exists'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        if 'price_per_hour' not in data:
            return jsonify({'error': 'price_per_hour is required'}), 400
        
        # Create companion profile
        new_companion = Companion(
            user_id=user_id,
            bio=data.get('bio', ''),
            price_per_hour=data['price_per_hour'],
            image_url=data.get('image_url'),
            availability=data.get('availability', True)
        )
        
        db.session.add(new_companion)
        db.session.commit()
        
        return jsonify({
            'message': 'Companion profile created successfully',
            'companion': new_companion.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@companion_bp.route('/<int:companion_id>', methods=['PUT'])
@jwt_required()
def update_companion(companion_id):
    """Update companion profile"""
    try:
        user_id = get_current_user_id()
        companion = Companion.query.get(companion_id)
        
        if not companion:
            return jsonify({'error': 'Companion not found'}), 404
        
        # Check if user owns this companion profile
        if companion.user_id != user_id:
            return jsonify({'error': 'Unauthorized to update this profile'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'bio' in data:
            companion.bio = data['bio']
        if 'price_per_hour' in data:
            companion.price_per_hour = data['price_per_hour']
        if 'image_url' in data:
            companion.image_url = data['image_url']
        if 'availability' in data:
            companion.availability = data['availability']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Companion profile updated successfully',
            'companion': companion.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@companion_bp.route('/<int:companion_id>', methods=['DELETE'])
@jwt_required()
def delete_companion(companion_id):
    """Delete companion profile"""
    try:
        user_id = get_current_user_id()
        companion = Companion.query.get(companion_id)
        
        if not companion:
            return jsonify({'error': 'Companion not found'}), 404
        
        # Check if user owns this companion profile
        if companion.user_id != user_id:
            return jsonify({'error': 'Unauthorized to delete this profile'}), 403
        
        db.session.delete(companion)
        db.session.commit()
        
        return jsonify({'message': 'Companion profile deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500