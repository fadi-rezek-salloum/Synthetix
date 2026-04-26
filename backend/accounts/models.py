from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", _("Admin")
        SELLER = "SELLER", _("Seller")
        CUSTOMER = "CUSTOMER", _("Customer")

    role = models.CharField(
        max_length=10, choices=Role.choices, default=Role.CUSTOMER, db_index=True
    )

    email = models.EmailField(_("email address"), unique=True)

    phone_number = models.CharField(max_length=20, blank=True, help_text="Used for OTP later")
    is_phone_verified = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.role})"


class SellerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    store_name = models.CharField(max_length=100, unique=True)
    store_logo = models.ImageField(upload_to="store_logos/", blank=True, null=True)
    description = models.TextField(blank=True, help_text="About the brand")

    tax_id = models.CharField(max_length=50, blank=True, help_text="For legal compliance")
    stripe_account_id = models.CharField(
        max_length=100, blank=True, help_text="For vendor payouts"
    )

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.store_name


class CustomerProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer_profile")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    shipping_address = models.TextField(blank=True)

    preferred_size_top = models.CharField(max_length=20, blank=True)
    preferred_size_bottom = models.CharField(max_length=20, blank=True)
    ai_style_preferences = models.JSONField(
        default=list, blank=True, help_text="What the AI learns they like"
    )

    def __str__(self):
        return f"Customer: {self.user.email}"


class Address(models.Model):
    class AddressType(models.TextChoices):
        SHIPPING = "SHIPPING", _("Shipping")
        BILLING = "BILLING", _("Billing")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses"
    )

    address_type = models.CharField(
        max_length=10, choices=AddressType.choices, default=AddressType.SHIPPING
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)

    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street_address}, {self.city}"
