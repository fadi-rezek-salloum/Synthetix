import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from accounts.models import SellerProfile
from catalog.models import Category, Product, ProductVariant

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with luxury products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create a Verified Seller
        seller_user, created = User.objects.get_or_create(
            email='luxury_vendor@synthetix.com',
            defaults={'role': 'SELLER', 'is_staff': True}
        )
        if created:
            seller_user.set_password('password123')
            seller_user.save()
        
        seller_profile, _ = SellerProfile.objects.get_or_create(
            user=seller_user,
            defaults={'store_name': 'Synthetix Boutique', 'is_verified': True}
        )

        # 2. Create Category
        cat, _ = Category.objects.get_or_create(name='Outerwear')

        # 3. Product Data
        products_data = [
            {
                'name': 'Obsidian Trench Coat',
                'brand': 'SYNTHETIX',
                'price': 1200.00,
                'desc': 'A signature waterproof trench coat in deep obsidian black.'
            },
            {
                'name': 'Midnight Silk Bomber',
                'brand': 'SYNTHETIX',
                'price': 850.00,
                'desc': 'Pure Italian silk bomber jacket with hand-stitched detailing.'
            },
            {
                'name': 'Titanium Tech Parka',
                'brand': 'SYNTHETIX',
                'price': 1500.00,
                'desc': 'Advanced thermal regulation technology in a sleek titanium grey shell.'
            },
            {
                'name': 'Alabaster Wool Blazer',
                'brand': 'SYNTHETIX',
                'price': 950.00,
                'desc': 'Minimalist blazer crafted from ethically sourced merino wool.'
            }
        ]

        for p_data in products_data:
            product, created = Product.objects.get_or_create(
                name=p_data['name'],
                defaults={
                    'vendor': seller_user,
                    'brand': p_data['brand'],
                    'base_price': p_data['price'],
                    'description': p_data['desc'],
                    'category': cat,
                    'is_featured': True
                }
            )
            
            if created:
                # Add Variants
                for size in ['S', 'M', 'L']:
                    ProductVariant.objects.create(
                        product=product,
                        size=size,
                        color='Midnight Black',
                        stock=random.randint(5, 20)
                    )
                self.stdout.write(f'Created product: {product.name}')

        self.stdout.write(self.style.SUCCESS('Successfully seeded luxury catalog!'))
