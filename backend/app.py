from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import init_db
import os
from dotenv import load_dotenv

load_dotenv() 

# Import controllers
from controllers.auth_controller import auth_bp
from controllers.user_controller import user_bp
from controllers.companion_controller import companion_bp
from controllers.booking_controller import booking_bp

def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/bondmate_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8A9B0C1D2E3F')

    # Initialize extensions
    CORS(app)
    JWTManager(app)

    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(companion_bp)
    app.register_blueprint(booking_bp)

    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'BondMate API - Companion Booking Platform',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'users': '/api/users',
                'companions': '/api/companions',
                'bookings': '/api/bookings'
            }
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)