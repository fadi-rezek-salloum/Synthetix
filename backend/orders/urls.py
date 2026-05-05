from django.urls import include, path
from rest_framework.routers import SimpleRouter
from .views import CartViewSet, OrderViewSet

router = SimpleRouter()
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("", include(router.urls)),
]
