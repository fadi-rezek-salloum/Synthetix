from allauth.socialaccount.models import SocialAccount, SocialApp
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.jwt_auth import set_jwt_cookies
from dj_rest_auth.utils import jwt_encode
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
import re
import requests

from .models import Address, CustomerProfile, SellerProfile
from .permissions import IsCustomer, IsSeller
from .serializers import AddressSerializer, CustomerProfileSerializer, SellerProfileSerializer, UserSerializer

User = get_user_model()

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
        token = request.data.get('access_token')
        if not token:
            return Response({"error": "No token provided"}, status=400)
            
        try:
            # Verify token directly with Google for better reliability
            google_res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                params={"access_token": token},
                timeout=10
            )
            
            if not google_res.ok:
                return Response({"error": "Invalid Google token"}, status=400)
                
            data = google_res.json()
            email = data.get("email")
            
            if not email:
                return Response({"error": "Could not retrieve email from Google"}, status=400)
                
            user_exists = User.objects.filter(email=email).exists()
            
            return Response({
                "exists": user_exists,
                "email": email,
                "first_name": data.get("given_name", ""),
                "last_name": data.get("family_name", ""),
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class GoogleSocialRegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('access_token')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        
        if not all([token, password, phone_number]):
            return Response({"error": "Token, password and phone number are required"}, status=400)
            
        # 1. Validate Phone Number (Basic check for 10+ digits)
        clean_phone = re.sub(r'\D', '', phone_number)
        if len(clean_phone) < 10:
            return Response({"error": "Please enter a valid phone number with at least 10 digits."}, status=400)

        try:
            # 2. Verify token with Google
            google_res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                params={"access_token": token},
                timeout=10
            )
            
            if not google_res.ok:
                return Response({"error": "Invalid Google token"}, status=400)
                
            data = google_res.json()
            email = data.get("email")
            
            if User.objects.filter(email=email).exists():
                return Response({"error": "User already exists"}, status=400)
            
            # 3. Validate Password Strength
            try:
                validate_password(password)
            except ValidationError as e:
                return Response({"error": e.messages}, status=400)

            # 4. Create the user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=data.get("given_name", ""),
                last_name=data.get("family_name", ""),
                phone_number=phone_number,
                role=User.Role.CUSTOMER
            )
            
            # 5. Link to SocialAccount
            adapter = GoogleOAuth2Adapter(request)
            app = SocialApp.objects.get(provider=adapter.provider_id)
            
            SocialAccount.objects.create(
                user=user,
                provider=adapter.provider_id,
                uid=data.get("sub"),
                extra_data=data
            )
            
            # 6. Handle Avatar
            avatar_url = data.get("picture")
            if avatar_url:
                try:
                    profile, _ = CustomerProfile.objects.get_or_create(user=user)
                    avatar_res = requests.get(avatar_url, timeout=10)
                    if avatar_res.status_code == 200:
                        profile.avatar.save(f"avatar_{user.id}.jpg", ContentFile(avatar_res.content), save=True)
                except Exception as avatar_err:
                    print(f"Non-critical error saving avatar: {avatar_err}")
            
            # 7. Generate tokens
            access, refresh = jwt_encode(user)
            
            # Refresh from DB to get the profile and avatar we just created/saved
            user.refresh_from_db()
            
            response = Response({
                "user": UserSerializer(user).data,
                "access": str(access),
                "refresh": str(refresh),
            })
            
            # Set HTTP-only cookies for the response
            set_jwt_cookies(response, access, refresh)
            
            return response
        except SocialApp.DoesNotExist:
            return Response({"error": "Google SocialApp not configured"}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
