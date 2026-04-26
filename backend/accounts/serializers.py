from rest_framework import serializers

from .models import Address, CustomerProfile, SellerProfile, User


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["user"]


class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "role", "phone_number", "is_phone_verified", "addresses"]
        read_only_fields = ["email", "role", "is_phone_verified"]


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "user",
            "avatar",
            "preferred_size_top",
            "preferred_size_bottom",
            "ai_style_preferences",
        ]


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "user",
            "store_name",
            "store_logo",
            "description",
            "tax_id",
            "stripe_account_id",
            "is_verified",
            "created_at",
        ]

        read_only_fields = ["is_verified", "created_at"]
