from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

from .models import User


class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.CUSTOMER)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["role"] = self.validated_data.get("role", User.Role.CUSTOMER)
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get("role")
        user.save()
        return user
