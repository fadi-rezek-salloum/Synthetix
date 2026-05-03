from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

from .models import User


class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.CUSTOMER)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    
    avatar = serializers.ImageField(required=False, allow_null=True)
    logo = serializers.ImageField(required=False, allow_null=True)
    
    # Seller Fields
    store_name = serializers.CharField(required=False, allow_blank=True)

    def validate_phone_number(self, value):
        import re
        clean_phone = re.sub(r'\D', '', value)
        if len(clean_phone) < 10:
            raise serializers.ValidationError("Please enter a valid phone number with at least 10 digits.")
        return value

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["role"] = self.validated_data.get("role", User.Role.CUSTOMER)
        data["first_name"] = self.validated_data.get("first_name", "")
        data["last_name"] = self.validated_data.get("last_name", "")
        data["phone_number"] = self.validated_data.get("phone_number", "")
        data["avatar"] = self.validated_data.get("avatar", None)
        data["logo"] = self.validated_data.get("logo", None)
        data["store_name"] = self.validated_data.get("store_name", "")
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get("role")
        user.first_name = self.cleaned_data.get("first_name")
        user.last_name = self.cleaned_data.get("last_name")
        user.phone_number = self.cleaned_data.get("phone_number")
        user.save()

        if user.role == User.Role.SELLER:
            profile, _ = SellerProfile.objects.get_or_create(user=user)
            profile.store_name = self.cleaned_data.get("store_name") or f"Store_{user.id}"
            if self.cleaned_data.get("logo"):
                profile.store_logo = self.cleaned_data.get("logo")
            profile.save()
        elif user.role == User.Role.CUSTOMER:
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            if self.cleaned_data.get("avatar"):
                profile.avatar = self.cleaned_data.get("avatar")
            profile.save()
        
        return user
