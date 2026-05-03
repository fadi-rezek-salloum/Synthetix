from dj_rest_auth.registration.views import ConfirmEmailView, VerifyEmailView
from django.conf import settings
from django.urls import include, path
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CustomerProfileView,
    GoogleLogin,
    GoogleSocialCheckView,
    GoogleSocialRegisterView,
    SellerProfileView,
)

router = DefaultRouter()
router.register(r"addresses", AddressViewSet, basename="address")

urlpatterns = [
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path(
        "auth/registration/account-confirm-email/<str:key>/",
        ConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    path(
        "auth/password-reset/confirm/<uidb64>/<token>/",
        RedirectView.as_view(
            url=f"{settings.FRONTEND_URL}/auth/password-reset-confirm/%(uidb64)s/%(token)s/",
            permanent=False,
        ),
        name="password_reset_confirm",
    ),
    path("auth/google/", GoogleLogin.as_view(), name="google_login"),
    path("auth/google/check/", GoogleSocialCheckView.as_view(), name="google_check"),
    path("auth/google/register/", GoogleSocialRegisterView.as_view(), name="google_register"),
    path("profile/customer/", CustomerProfileView.as_view(), name="customer-profile"),
    path("profile/seller/", SellerProfileView.as_view(), name="seller-profile"),
    path("", include(router.urls)),
]
