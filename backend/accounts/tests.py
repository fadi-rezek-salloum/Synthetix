from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


class StaleJwtCookieTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_invalid_access_cookie_does_not_block_public_catalog(self):
        self.client.cookies["synthetix-auth"] = "not-a-real-token"

        response = self.client.get("/api/v1/catalog/products/")

        self.assertEqual(response.status_code, 200)

    def test_refresh_for_deleted_user_returns_401_and_clears_cookies(self):
        user = get_user_model().objects.create_user(
            email="deleted-user@example.com",
            username="deleted-user",
            password="test-password",
        )
        refresh = str(RefreshToken.for_user(user))
        user.delete()
        self.client.cookies["synthetix-refresh"] = refresh

        response = self.client.post("/api/v1/accounts/auth/token/refresh/")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["code"], "user_not_found")
        self.assertIn("synthetix-auth", response.cookies)
        self.assertIn("synthetix-refresh", response.cookies)
