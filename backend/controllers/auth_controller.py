from flask import Blueprint, request, jsonify
from database import db
from models import User
from utils.password_handler import hash_password, verify_password
from utils.jwt_handler import generate_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Validate role
        if data['role'] not in ['user', 'companion', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Hash password
        hashed_password = hash_password(data['password'])
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role=data['role'],
            state=data.get('state'),
            district=data.get('district'),
            age=data.get('age'),
            interests=data.get('interests', '')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_user.id, new_user.role)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(data['password'], user.password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user.id, user.role)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500