from django.contrib import admin

from .models import (
    Category,
    PriceHistory,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    StockLog,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "base_price", "is_featured", "created_at")
    list_filter = ("brand", "category", "gender", "is_featured")
    search_fields = ("name", "brand", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductVariantInline]

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "slug", "brand", "category", "gender", "is_featured")},
        ),
        ("Pricing", {"fields": ("base_price", "discount_price")}),
        ("Descriptions", {"fields": ("description", "ai_description", "ai_style_tags")}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ("product", "price", "recorded_at")
    readonly_fields = ("product", "price", "recorded_at")


@admin.register(StockLog)
class StockLogAdmin(admin.ModelAdmin):
    list_display = ("variant", "change", "reason", "timestamp")
    readonly_fields = ("variant", "change", "reason", "timestamp")


admin.site.register(Review)
