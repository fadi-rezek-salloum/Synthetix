from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductImageViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    ReviewViewSet,
    StockLogViewSet,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"images", ProductImageViewSet)
router.register(r"variants", ProductVariantViewSet)
router.register(r"reviews", ReviewViewSet)
router.register(r"stock-logs", StockLogViewSet, basename="stock-logs")

urlpatterns = [
    path("", include(router.urls)),
]
