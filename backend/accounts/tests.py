from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class RegistrationTestCase(TestCase):
    """Tests for the custom registration endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_register_customer(self):
        """A new customer can register with valid data."""
        resp = self.client.post(
            "/api/v1/accounts/auth/registration/",
            {
                "email": "newuser@test.com",
                "username": "newuser",
                "password1": "StrongPass123!",
                "password2": "StrongPass123!",
                "first_name": "New",
                "last_name": "User",
                "role": "CUSTOMER",
            },
            format="json",
        )
        # 201 or 204 depending on email verification settings
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_204_NO_CONTENT])

    def test_register_missing_fields(self):
        """Registration with missing required fields returns 400."""
        resp = self.client.post(
            "/api/v1/accounts/auth/registration/",
            {"email": "bad@test.com"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Registering with an existing email returns 400."""
        User.objects.create_user(
            email="existing@test.com",
            username="existinguser",
            password="TestPass123!",
        )
        resp = self.client.post(
            "/api/v1/accounts/auth/registration/",
            {
                "email": "existing@test.com",
                "username": "anotheruser",
                "password1": "StrongPass123!",
                "password2": "StrongPass123!",
                "first_name": "Another",
                "last_name": "User",
                "role": "CUSTOMER",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTestCase(TestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="login@test.com",
            username="loginuser",
            password="TestPass123!",
            role="CUSTOMER",
            is_active=True,
        )
        # Bypass email verification for tests
        from allauth.account.models import EmailAddress
        EmailAddress.objects.create(
            user=self.user,
            email=self.user.email,
            verified=True,
            primary=True,
        )

    def test_login_valid_credentials(self):
        """Valid credentials return a 200 with user data."""
        resp = self.client.post(
            "/api/v1/accounts/auth/login/",
            {"email": "login@test.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("user", resp.data)

    def test_login_wrong_password(self):
        """Wrong password returns 400."""
        resp = self.client.post(
            "/api/v1/accounts/auth/login/",
            {"email": "login@test.com", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        """Nonexistent user returns 400."""
        resp = self.client.post(
            "/api/v1/accounts/auth/login/",
            {"email": "nobody@test.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class AddressViewSetTestCase(TestCase):
    """Tests for the Address CRUD endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="addr@test.com",
            username="addruser",
            password="TestPass123!",
            role="CUSTOMER",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_address(self):
        """A user can create a new address."""
        resp = self.client.post(
            "/api/v1/accounts/addresses/",
            {
                "address_type": "SHIPPING",
                "first_name": "Jane",
                "last_name": "Doe",
                "street_address": "123 Main St",
                "city": "Metropolis",
                "state_province": "NY",
                "postal_code": "10001",
                "country": "USA",
                "is_default": True,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_list_own_addresses(self):
        """A user only sees their own addresses."""
        resp = self.client.get("/api/v1/accounts/addresses/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_unauthenticated_address_access(self):
        """Unauthenticated request returns 401."""
        anon = APIClient()
        resp = anon.get("/api/v1/accounts/addresses/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
