from rest_framework import serializers

from .models import (
    Category,
    PriceHistory,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    StockLog,
)


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ["id", "price", "recorded_at"]


class StockLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLog
        fields = ["id", "variant", "change", "reason", "timestamp"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "product", "image", "is_feature", "alt_text"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "product", "size", "color", "stock", "price_override"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "product", "user", "rating", "comment", "created_at"]
        read_only_fields = ["user"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source="category.name")
    reviews = ReviewSerializer(many=True, read_only=True)
    price_history = PriceHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "gender",
            "description",
            "ai_description",
            "base_price",
            "discount_price",
            "category",
            "category_name",
            "ai_style_tags",
            "is_featured",
            "images",
            "variants",
            "reviews",
            "price_history",
        ]
