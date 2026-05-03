from django.apps import apps
from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
        verbose_name=_("Parent Category"),
    )
    slug = models.SlugField(_("Slug"), unique=True, blank=True)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.slug:
            self.slug = f"{slugify(self.name)}-{self.pk}"
            super().save(update_fields=["slug"])

    def __str__(self):
        return self.name


class Product(models.Model):
    class Gender(models.TextChoices):
        MEN = "M", _("Men")
        WOMEN = "W", _("Women")
        UNISEX = "U", _("Unisex")

    name = models.CharField(_("Product Name"), max_length=255)
    slug = models.SlugField(_("Slug"), unique=True, blank=True)

    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
    )

    brand = models.CharField(_("Brand"), max_length=100, default="Synthetix", db_index=True)
    gender = models.CharField(
        _("Gender"), max_length=1, choices=Gender.choices, default=Gender.UNISEX, db_index=True
    )
    description = models.TextField(
        _("Technical Description"), help_text=_("Technical specs (Material, Fit, etc.)")
    )
    ai_description = models.TextField(
        _("AI Marketing Copy"), blank=True, null=True, help_text=_("AI Storytelling copy")
    )
    base_price = models.DecimalField(_("Base Price"), max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(
        _("Discount Price"), max_digits=10, decimal_places=2, null=True, blank=True
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="products", verbose_name=_("Category")
    )
    ai_style_tags = models.JSONField(_("AI Style Tags"), default=list)

    is_featured = models.BooleanField(_("Is Featured"), default=False, db_index=True)
    is_active = models.BooleanField(_("Is Active"), default=True, db_index=True)

    created_at = models.DateTimeField(_("Created At"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        price_changed = False

        if not is_new:
            try:
                old_instance = Product.objects.get(pk=self.pk)
                if old_instance.base_price != self.base_price:
                    price_changed = True
            except Product.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if not self.slug:
            self.slug = f"{slugify(self.name)}-{self.pk}"
            super().save(update_fields=["slug"])

        if is_new or price_changed:
            PriceHistoryModel = apps.get_model("catalog", "PriceHistory")
            PriceHistoryModel.objects.create(product=self, price=self.base_price)

    def __str__(self):
        return f"[{self.brand}] {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(_("Image File"), upload_to="products/")
    is_feature = models.BooleanField(_("Is Main Image"), default=False)
    alt_text = models.CharField(_("Alt Text"), max_length=255, blank=True)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    sku = models.CharField(_("SKU"), max_length=100, unique=True, blank=True, null=True)
    size = models.CharField(_("Size"), max_length=50)
    color = models.CharField(_("Color"), max_length=50)
    stock = models.PositiveIntegerField(_("Stock"), default=0)
    price_override = models.DecimalField(
        _("Price Override"), max_digits=10, decimal_places=2, null=True, blank=True
    )

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        stock_changed = False
        diff = 0
        reason = "RESTOCK"
        if not is_new:
            try:
                old_variant = ProductVariant.objects.get(pk=self.pk)
                if old_variant.stock != self.stock:
                    stock_changed = True
                    diff = self.stock - old_variant.stock
                    reason = "RESTOCK" if diff > 0 else "SALE"
            except ProductVariant.DoesNotExist:
                pass
        else:
            if self.stock > 0:
                stock_changed = True
                diff = self.stock
        super().save(*args, **kwargs)
        if stock_changed:
            StockLogModel = apps.get_model("catalog", "StockLog")
            StockLogModel.objects.create(variant=self, change=diff, reason=reason)

    def __str__(self):
        return f"{self.product.name} - {self.color} ({self.size})"


class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="price_history")
    price = models.DecimalField(_("Price"), max_digits=10, decimal_places=2)
    recorded_at = models.DateTimeField(_("Recorded At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Price History")
        verbose_name_plural = _("Price Histories")
        ordering = ["-recorded_at"]


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(_("Rating"))
    comment = models.TextField(_("Comment"))
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        ordering = ["-created_at"]
        unique_together = ("product", "user")


class StockLog(models.Model):
    class Reason(models.TextChoices):
        SALE = "SALE", _("Sale")
        RESTOCK = "RESTOCK", _("Restock")
        RETURN = "RETURN", _("Return")
        DAMAGE = "DAMAGE", _("Damage/Waste")

    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name="stock_logs"
    )
    change = models.IntegerField(_("Stock Change"))
    reason = models.CharField(_("Reason"), max_length=10, choices=Reason.choices)
    timestamp = models.DateTimeField(_("Timestamp"), auto_now_add=True)

    class Meta:
        verbose_name = _("Stock Log")
        verbose_name_plural = _("Stock Logs")


class Wishlist(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="wishlist"
    )
    products = models.ManyToManyField(Product, related_name="wishlisted_by", blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Wishlist")
        verbose_name_plural = _("Wishlists")

    def __str__(self):
        return f"{self.user.email}'s Wishlist"
