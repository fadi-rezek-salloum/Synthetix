from rest_framework import serializers

from .models import Address, CustomerProfile, SellerProfile, User


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["user"]


class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    avatar = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", 
            "email", 
            "first_name", 
            "last_name", 
            "role", 
            "phone_number", 
            "is_phone_verified", 
            "addresses",
            "avatar",
            "logo"
        ]
        read_only_fields = ["email", "role", "is_phone_verified"]

    def get_avatar(self, obj):
        if hasattr(obj, 'customer_profile') and obj.customer_profile.avatar:
            return obj.customer_profile.avatar.url
        return None

    def get_logo(self, obj):
        if hasattr(obj, 'seller_profile') and obj.seller_profile.store_logo:
            return obj.seller_profile.store_logo.url
        return None


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
