from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("subtotal",)
    raw_id_fields = ("variant",)

    def subtotal(self, obj):
        return f"${obj.subtotal:.2f}"
    subtotal.short_description = "Subtotal"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "item_count", "total_price", "updated_at")
    search_fields = ("user__email",)
    inlines = [CartItemInline]

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"

    def total_price(self, obj):
        return f"${obj.total_price:.2f}"
    total_price.short_description = "Total"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("price",)
    raw_id_fields = ("product",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total_amount", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "tracking_number")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [OrderItemInline]
    list_editable = ("status",)
