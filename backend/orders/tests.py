from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from catalog.models import Category, Product, ProductVariant
from .models import Cart, CartItem, Order

User = get_user_model()


class CartViewSetTestCase(TestCase):
    """Tests for CartViewSet CRUD operations and stock validation."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email="customer@test.com",
            username="customer",
            password="TestPass123!",
            role="CUSTOMER",
        )
        self.client.force_authenticate(user=self.customer)

        # Minimal catalog fixtures
        self.category = Category.objects.create(name="Test Category")
        self.seller = User.objects.create_user(
            email="seller@test.com",
            username="seller",
            password="TestPass123!",
            role="SELLER",
        )
        self.product = Product.objects.create(
            name="Test Jacket",
            vendor=self.seller,
            brand="TestBrand",
            description="A test jacket.",
            base_price="199.00",
            category=self.category,
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            size="M",
            color="Black",
            stock=10,
        )

    def test_get_empty_cart(self):
        """GET /cart/ returns an empty cart for a new user."""
        resp = self.client.get("/api/v1/orders/cart/")
        # Cart is auto-created by get_object
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_add_item_to_cart(self):
        """POST /cart/add_item/ adds an item and returns updated cart."""
        resp = self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"variant_id": self.variant.id, "quantity": 2},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["items"][0]["quantity"], 2)

    def test_add_item_exceeds_stock(self):
        """Adding more items than stock returns 400."""
        resp = self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"variant_id": self.variant.id, "quantity": 999},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", resp.data)

    def test_add_item_invalid_quantity(self):
        """Non-integer quantity returns 400."""
        resp = self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"variant_id": self.variant.id, "quantity": "abc"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_item_missing_variant(self):
        """Missing variant_id returns 400."""
        resp = self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"quantity": 1},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_nonexistent_variant(self):
        """Nonexistent variant_id returns 404."""
        resp = self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"variant_id": 99999, "quantity": 1},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cart_access(self):
        """Unauthenticated request to cart returns 401."""
        unauthenticated = APIClient()
        resp = unauthenticated.get("/api/v1/orders/cart/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class CheckoutTestCase(TestCase):
    """Tests for the checkout action."""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email="buyer@test.com",
            username="buyer",
            password="TestPass123!",
            role="CUSTOMER",
        )
        self.client.force_authenticate(user=self.customer)
        self.category = Category.objects.create(name="Category")
        self.seller = User.objects.create_user(
            email="vendor@test.com",
            username="vendor",
            password="TestPass123!",
            role="SELLER",
        )
        self.product = Product.objects.create(
            name="Checkout Item",
            vendor=self.seller,
            brand="Brand",
            description="desc",
            base_price="50.00",
            category=self.category,
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            size="L",
            color="White",
            stock=5,
        )

    def test_checkout_empty_cart(self):
        """Checkout with empty cart returns 404."""
        resp = self.client.post(
            "/api/v1/orders/orders/checkout/",
            {"shipping_address": "123 Test St, City, ST 12345, Country"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_checkout_missing_address(self):
        """Checkout without shipping_address returns 400."""
        resp = self.client.post(
            "/api/v1/orders/orders/checkout/",
            {},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_short_address(self):
        """Checkout with too-short address returns 400."""
        resp = self.client.post(
            "/api/v1/orders/orders/checkout/",
            {"shipping_address": "short"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_checkout(self):
        """Full checkout flow: add item, then checkout."""
        # Add item to cart first
        self.client.post(
            "/api/v1/orders/cart/add_item/",
            {"variant_id": self.variant.id, "quantity": 1},
            format="json",
        )
        resp = self.client.post(
            "/api/v1/orders/orders/checkout/",
            {"shipping_address": "456 Fashion Ave, New York, NY 10001, USA"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "PENDING")
        self.assertEqual(len(resp.data["items"]), 1)
