"""
Google OAuth service for handling authentication and registration
Centralizes duplicate code and provides reusable methods
"""

import requests
import phonenumbers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from allauth.socialaccount.models import SocialAccount, SocialApp
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework import status
from rest_framework.response import Response
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.jwt_auth import set_jwt_cookies

from .models import CustomerProfile
from .serializers import UserSerializer

User = get_user_model()

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_REQUEST_TIMEOUT = 10
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


class GoogleAuthService:
    """Service for handling Google OAuth authentication and registration"""

    @staticmethod
    def verify_google_token(token: str) -> dict | None:
        """
        Verify Google token and retrieve user information
        Returns user data dict or None if token is invalid
        """
        if not token:
            return None

        try:
            response = requests.get(
                GOOGLE_USERINFO_URL,
                params={"access_token": token},
                timeout=GOOGLE_REQUEST_TIMEOUT,
            )

            if not response.ok:
                return None

            return response.json()
        except requests.RequestException:
            return None

    @staticmethod
    def check_user_exists(email: str) -> bool:
        """Check if user exists by email"""
        return User.objects.filter(email=email).exists()

    @staticmethod
    def validate_phone_number(phone_number: str) -> str:
        """
        Validate and format phone number
        Raises ValidationError if invalid
        Returns formatted phone number in E.164 format
        """
        try:
            parsed = phonenumbers.parse(phone_number, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValidationError("Please enter a valid phone number.")
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            raise ValidationError("Please enter a valid phone number with country code.")

    @staticmethod
    def validate_password_strength(password: str) -> None:
        """
        Validate password strength
        Raises ValidationError if password doesn't meet requirements
        """
        try:
            validate_password(password)
        except ValidationError as e:
            raise ValidationError(e.messages)

    @staticmethod
    def download_avatar(avatar_url: str, user_id: int) -> bytes | None:
        """Download avatar from URL with size limit"""
        if not avatar_url:
            return None

        try:
            response = requests.get(avatar_url, timeout=GOOGLE_REQUEST_TIMEOUT)
            if response.status_code != 200:
                return None

            # Check size limit
            if len(response.content) > MAX_AVATAR_SIZE:
                return None

            return response.content
        except requests.RequestException:
            return None

    @staticmethod
    def save_avatar_to_profile(user: User, avatar_content: bytes) -> bool:
        """Save avatar to user's customer profile"""
        try:
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            profile.avatar.save(
                f"avatar_{user.id}.jpg",
                ContentFile(avatar_content),
                save=True,
            )
            return True
        except Exception:
            return False

    @staticmethod
    def create_social_account(user: User, google_data: dict, request) -> bool:
        """Create SocialAccount for user"""
        try:
            adapter = GoogleOAuth2Adapter(request)
            app = SocialApp.objects.get(provider=adapter.provider_id)

            SocialAccount.objects.create(
                user=user,
                provider=adapter.provider_id,
                uid=google_data.get("sub"),
                extra_data=google_data,
            )
            return True
        except SocialApp.DoesNotExist:
            raise Exception("Google SocialApp not configured")
        except Exception as e:
            raise Exception(f"Failed to create social account: {str(e)}")

    @staticmethod
    def create_user_from_google(
        email: str,
        password: str,
        phone_number: str,
        google_data: dict,
        request,
    ) -> dict:
        """
        Complete user creation flow from Google authentication
        Returns dict with user data and JWT tokens
        """
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            raise ValidationError("User with this email already exists")

        # Validate password
        GoogleAuthService.validate_password_strength(password)

        # Validate and format phone number
        formatted_phone = GoogleAuthService.validate_phone_number(phone_number)

        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=google_data.get("given_name", ""),
            last_name=google_data.get("family_name", ""),
            phone_number=formatted_phone,
            role=User.Role.CUSTOMER,
        )

        # Create social account
        GoogleAuthService.create_social_account(user, google_data, request)

        # Download and save avatar
        avatar_url = google_data.get("picture")
        if avatar_url:
            avatar_content = GoogleAuthService.download_avatar(avatar_url, user.id)
            if avatar_content:
                GoogleAuthService.save_avatar_to_profile(user, avatar_content)

        # Generate JWT tokens
        access, refresh = jwt_encode(user)
        user.refresh_from_db()

        return {
            "user": UserSerializer(user).data,
            "access": str(access),
            "refresh": str(refresh),
        }

    @staticmethod
    def get_check_response(token: str) -> Response:
        """
        Check if user exists and return their info
        Used for login vs register flow determination
        """
        google_data = GoogleAuthService.verify_google_token(token)

        if not google_data:
            return Response(
                {"error": "Invalid Google token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = google_data.get("email")
        if not email:
            return Response(
                {"error": "Could not retrieve email from Google"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "exists": GoogleAuthService.check_user_exists(email),
                "email": email,
                "first_name": google_data.get("given_name", ""),
                "last_name": google_data.get("family_name", ""),
            },
            status=status.HTTP_200_OK,
        )
