from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from catalog.serializers import ProductVariantSerializer, ProductSerializer


class CartProductVariantSerializer(ProductVariantSerializer):
    product = ProductSerializer(read_only=True)


class CartItemSerializer(serializers.ModelSerializer):
    variant = CartProductVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ["id", "variant", "variant_id", "quantity", "subtotal"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "total_price", "updated_at"]
        read_only_fields = ["user"]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "variant_info", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "shipping_address",
            "tracking_number",
            "items",
            "created_at"
        ]
        read_only_fields = ["status", "total_amount", "tracking_number"]
