from allauth.socialaccount.models import SocialAccount, SocialApp
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.jwt_auth import get_refresh_view, set_jwt_cookies, unset_jwt_cookies
from dj_rest_auth.utils import jwt_encode
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
import phonenumbers
import requests
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, CustomerProfile, SellerProfile
from .permissions import IsCustomer, IsSeller
from .serializers import AddressSerializer, CustomerProfileSerializer, SellerProfileSerializer, UserSerializer
from .services import GoogleAuthService

User = get_user_model()


class SafeTokenRefreshView(get_refresh_view()):
    """Token refresh that properly handles deleted users"""
    
    def post(self, request, *args, **kwargs):
        try:
            # Try to get refresh token from request
            refresh_token_str = None
            if 'refresh' in request.data:
                refresh_token_str = request.data.get('refresh')
            elif hasattr(request, 'COOKIES') and 'synthetix-refresh' in request.COOKIES:
                refresh_token_str = request.COOKIES.get('synthetix-refresh')
            
            if refresh_token_str:
                try:
                    refresh_token = RefreshToken(refresh_token_str)
                    # Check if user still exists
                    user_id = refresh_token.get('user_id')
                    if user_id:
                        User.objects.get(id=user_id)
                except User.DoesNotExist:
                    response = Response(
                        {"detail": "User not found", "code": "user_not_found"},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
                    unset_jwt_cookies(response)
                    return response
                except (InvalidToken, TokenError, ValueError, TypeError):
                    # Invalid token, let the parent handle it
                    pass
            
            return super().post(request, *args, **kwargs)
        except User.DoesNotExist:
            response = Response(
                {"detail": "User not found", "code": "user_not_found"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            unset_jwt_cookies(response)
            return response

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            unset_jwt_cookies(response)
        return super().finalize_response(request, response, *args, **kwargs)

class CustomerProfileView(generics.RetrieveUpdateAPIView):

    serializer_class = CustomerProfileSerializer
    permission_classes = [IsCustomer]

    def get_object(self):
        return self.request.user.customer_profile


class SellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [IsSeller]

    def get_object(self):
        return self.request.user.seller_profile


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


# I'll create a better flow: A "Social Register" flow.
class GoogleSocialCheckView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('access_token') or request.data.get('credential')
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        return GoogleAuthService.get_check_response(token)


class GoogleCredentialLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('credential') or request.data.get('access_token')
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        google_data = GoogleAuthService.verify_google_token(token)
        if not google_data:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED)

        email = google_data.get("email")
        if not email:
            return Response(
                {"error": "Could not retrieve email from Google"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not User.objects.filter(email=email).exists():
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

        result = GoogleAuthService.login_existing_google_user(email)
        response = Response(result, status=status.HTTP_200_OK)
        set_jwt_cookies(response, result["access"], result["refresh"])
        return response


class GoogleSocialRegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('access_token') or request.data.get('credential')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        
        if not all([token, password, phone_number]):
            return Response(
                {"error": "Token, password and phone number are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify Google token
            google_data = GoogleAuthService.verify_google_token(token)
            if not google_data:
                return Response(
                    {"error": "Invalid Google token"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            email = google_data.get("email")
            if not email:
                return Response(
                    {"error": "Could not retrieve email from Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user from Google data
            result = GoogleAuthService.create_user_from_google(
                email=email,
                password=password,
                phone_number=phone_number,
                google_data=google_data,
                request=request,
            )
            
            response = Response(result, status=status.HTTP_201_CREATED)
            set_jwt_cookies(response, result["access"], result["refresh"])
            return response
            
        except ValidationError as e:
            error_messages = e.messages if hasattr(e, 'messages') else [str(e)]
            return Response(
                {"error": error_messages},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AccountDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        instance.delete()

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        response = Response(
            {"detail": "Your account has been permanently deleted."},
            status=status.HTTP_200_OK,
        )
        unset_jwt_cookies(response)
        return response
