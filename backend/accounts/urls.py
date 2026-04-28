from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CustomConfirmEmailView,
    CustomerProfileView,
    SellerProfileView,
)

router = DefaultRouter()
router.register(r"addresses", AddressViewSet, basename="address")

urlpatterns = [
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path(
        "auth/registration/verify-email/",
        CustomConfirmEmailView.as_view(),
        name="rest_verify_email",
    ),
    path("profile/customer/", CustomerProfileView.as_view(), name="customer-profile"),
    path("profile/seller/", SellerProfileView.as_view(), name="seller-profile"),
    path("", include(router.urls)),
]
