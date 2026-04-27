import random

from accounts.models import SellerProfile
from catalog.models import Category, Product, ProductVariant
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with luxury products and AI insights"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding AI-Enhanced data...")

        seller_user, _ = User.objects.get_or_create(
            email="luxury_vendor@synthetix.com", defaults={"role": "SELLER", "is_staff": True}
        )
        SellerProfile.objects.update_or_create(user=seller_user, defaults={"is_verified": True})
        cat, _ = Category.objects.get_or_create(name="Signature Collection")

        products_data = [
            {
                "name": "Obsidian Trench Coat",
                "price": 1200.00,
                "ai_desc": "A masterpiece of silhouette and shadows. This obsidian trench uses a light-absorbing weave to create a striking, near-void aesthetic.",
                "tags": ["Avant-Garde", "Minimalist", "Noir", "High-Contrast"],
            },
            {
                "name": "Midnight Silk Bomber",
                "price": 850.00,
                "ai_desc": "The fluid motion of silk meets the structure of urban wear. Designed for the transition from metropolitan days to exclusive nights.",
                "tags": ["Fluidity", "Urban Luxury", "Nightwear", "Tactile"],
            },
            {
                "name": "Titanium Tech Parka",
                "price": 1500.00,
                "ai_desc": "Constructed with liquid-metal aesthetics and thermal-reactive fibers. A vision of survivalist luxury for the digital age.",
                "tags": ["Techwear", "Futurism", "Cybernetic", "Performance"],
            },
            {
                "name": "Alabaster Wool Blazer",
                "price": 950.00,
                "ai_desc": "Purity in form. This alabaster blazer uses architectural tailoring to redefine the classic formal silhouette.",
                "tags": ["Architectural", "Ethereal", "Sartorial", "Monochrome"],
            },
        ]

        for p_data in products_data:
            product, _ = Product.objects.update_or_create(
                name=p_data["name"],
                defaults={
                    "vendor": seller_user,
                    "brand": "SYNTHETIX",
                    "base_price": p_data["price"],
                    "description": "A premium garment from our flagship series.",
                    "ai_description": p_data["ai_desc"],
                    "ai_style_tags": p_data["tags"],
                    "category": cat,
                    "is_featured": True,
                    "is_active": True,
                },
            )
            # Ensure variants exist
            for size in ["S", "M", "L"]:
                ProductVariant.objects.get_or_create(
                    product=product, size=size, color="Default", defaults={"stock": 10}
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded AI data!"))
