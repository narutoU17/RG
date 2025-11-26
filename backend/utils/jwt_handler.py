from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import timedelta

def generate_token(user_id, role):
    """Generate JWT token with user identity"""
    additional_claims = {"role": role}
    access_token = create_access_token(
        identity=str(user_id),
        additional_claims=additional_claims,
        expires_delta=timedelta(days=7)
    )
    return access_token

def get_current_user_id():
    """Get current user ID from JWT token"""
    return int(get_jwt_identity())   # convert back to int
