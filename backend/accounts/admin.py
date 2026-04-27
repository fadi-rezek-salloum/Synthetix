from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Address, CustomerProfile, SellerProfile, User


class CustomerProfileInline(admin.StackedInline):
    model = CustomerProfile
    can_delete = False
    fk_name = "user"
    verbose_name_plural = "Customer Profile"


class AddressInline(admin.TabularInline):
    model = Address
    extra = 1
    verbose_name_plural = "Addresses"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "email",
        "username",
        "first_name",
        "last_name",
        "is_staff",
        "role",
    ]
    list_filter = ["is_staff", "role", "is_active"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering = ["email"]
    filter_horizontal = []

    fieldsets = UserAdmin.fieldsets + (
        ("Platform Roles", {"fields": ("role",)}),
        ("Personal Information", {"fields": ("phone_number", "is_phone_verified")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Platform Roles", {"fields": ("role",)}),
        ("Personal Information", {"fields": ("phone_number", "is_phone_verified")}),
    )

    inlines = [CustomerProfileInline, AddressInline]


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ["store_name", "user", "is_verified", "created_at"]
    list_filter = ["is_verified", "created_at"]
    search_fields = ["store_name", "user__email"]
    list_editable = ["is_verified"]
    readonly_fields = ["created_at"]
    fieldsets = (
        ("Business Information", {"fields": ("store_name", "user", "description")}),
        ("Verification Status", {"fields": ("is_verified",)}),
        ("Timestamps", {"fields": ("created_at",)}),
    )


admin.site.register(CustomerProfile)
admin.site.register(Address)
