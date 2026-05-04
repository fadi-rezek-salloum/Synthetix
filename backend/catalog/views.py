import django_filters
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Category, Product, ProductImage, ProductVariant, Review, StockLog, Wishlist
from .permissions import (
    IsAdminOrReadOnly,
    IsOwnerOrReadOnly,
    IsProductOwnerOrReadOnly,
    IsSellerOrReadOnly,
)
from .serializers import (
    CategorySerializer,
    ProductImageSerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ReviewSerializer,
    StockLogSerializer,
    WishlistSerializer,
)

class WishlistViewSet(viewsets.ModelViewSet):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def get_object(self):
        obj, _ = Wishlist.objects.get_or_create(user=self.request.user)
        return obj

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id is required"}, status=400)
            
        wishlist = self.get_object()
        try:
            product = Product.objects.get(id=product_id)
            if product in wishlist.products.all():
                wishlist.products.remove(product)
                status = "removed"
            else:
                wishlist.products.add(product)
                status = "added"
            
            return Response({"status": status, "count": wishlist.products.count()})
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr='lte')
    category = django_filters.CharFilter(field_name="category__slug")
    brand = django_filters.CharFilter(field_name="brand", lookup_expr='iexact')
    gender = django_filters.CharFilter(field_name="gender", lookup_expr='iexact')
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Product
        fields = ['category', 'brand', 'gender', 'is_featured', 'min_price', 'max_price']


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSellerOrReadOnly, IsOwnerOrReadOnly]

    queryset = (
        Product.objects.all().select_related("category").prefetch_related("images", "variants")
    )
    serializer_class = ProductSerializer
    lookup_field = "slug"

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "brand"]
    ordering_fields = ["base_price", "created_at"]

    def get_queryset(self):
        base_query = (
            Product.objects.all()
            .select_related("category", "vendor")
            .prefetch_related("images", "variants", "reviews__user")
        )

        if self.request.user.is_authenticated and self.request.user.role == "SELLER":
            return base_query.filter(vendor=self.request.user)

        return base_query.filter(is_active=True, vendor__seller_profile__is_verified=True)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

    @action(detail=False, methods=['get'])
    def brands(self, request):
        """Get list of distinct brands"""
        brands = (
            Product.objects.filter(is_active=True)
            .values_list('brand', flat=True)
            .distinct()
            .order_by('brand')
        )
        return Response({
            "brands": list(brands)
        }, status=status.HTTP_200_OK)


class ProductImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSellerOrReadOnly, IsProductOwnerOrReadOnly]
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        if product.vendor != self.request.user:
            raise PermissionDenied(_("You do not own this product."))
        serializer.save()


class ProductVariantViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSellerOrReadOnly, IsProductOwnerOrReadOnly]
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        if product.vendor != self.request.user:
            raise PermissionDenied(_("You do not own this product."))
        serializer.save()


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    serializer_class = ReviewSerializer
    queryset = Review.objects.all()

    def get_queryset(self):
        return Review.objects.select_related("user", "product").all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StockLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsSellerOrReadOnly]
    serializer_class = StockLogSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == "SELLER":
            return StockLog.objects.filter(variant__product__vendor=self.request.user)
        return StockLog.objects.none()
