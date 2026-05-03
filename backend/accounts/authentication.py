from django.contrib.auth import get_user_model
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from rest_framework import exceptions
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class SafeJWTCookieAuthentication(JWTCookieAuthentication):
    """
    Treat stale/invalid auth cookies as anonymous requests.

    This keeps public endpoints usable when a browser still has old JWT cookies,
    while preserving strict failures for explicit Authorization headers.
    """

    def authenticate(self, request):
        has_auth_header = self.get_header(request) is not None

        try:
            return super().authenticate(request)
        except (
            exceptions.AuthenticationFailed,
            InvalidToken,
            TokenError,
            get_user_model().DoesNotExist,
        ):
            if has_auth_header:
                raise
            return None
