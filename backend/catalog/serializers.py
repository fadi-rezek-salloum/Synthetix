from rest_framework import serializers

from .models import (
    Category,
    PriceHistory,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    StockLog,
    Wishlist,
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
    user_email = serializers.ReadOnlyField(source="user.email")
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "product", "user", "user_email", "user_name", "rating", "comment", "created_at"]
        read_only_fields = ["user", "user_email"]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


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


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Product.objects.all(), source="products"
    )

    class Meta:
        model = Wishlist
        fields = ["id", "user", "products", "product_ids", "updated_at"]
        read_only_fields = ["user"]
