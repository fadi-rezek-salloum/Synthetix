from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Category, Product, ProductImage, ProductVariant, Review, StockLog
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
)


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

    filterset_fields = ["category__slug", "brand", "gender", "is_featured"]

    search_fields = ["name", "description", "brand"]

    ordering_fields = ["base_price", "created_at"]

    def get_queryset(self):
        base_query = (
            Product.objects.all()
            .select_related("category")
            .prefetch_related("images", "variants", "reviews")
        )

        if self.request.user.is_authenticated and self.request.user.role == "SELLER":
            return base_query.filter(vendor=self.request.user)

        return base_query.filter(is_active=True, vendor__seller_profile__is_verified=True)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)


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
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StockLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsSellerOrReadOnly]
    serializer_class = StockLogSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == "SELLER":
            return StockLog.objects.filter(variant__product__vendor=self.request.user)
        return StockLog.objects.none()
