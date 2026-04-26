from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Address, CustomerProfile, SellerProfile, User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ["email", "username", "role", "is_phone_verified", "is_staff"]
    fieldsets = UserAdmin.fieldsets + (
        ("Platform Roles", {"fields": ("role", "phone_number", "is_phone_verified")}),
    )


admin.site.register(User, CustomUserAdmin)


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ["store_name", "user", "is_verified", "created_at"]
    list_filter = ["is_verified", "created_at"]
    search_fields = ["store_name", "user__email"]
    list_editable = ["is_verified"]


admin.site.register(CustomerProfile)
admin.site.register(Address)
