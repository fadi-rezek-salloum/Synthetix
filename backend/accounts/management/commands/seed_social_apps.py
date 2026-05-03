from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os

class Command(BaseCommand):
    help = 'Seed Social Applications for Google and Facebook'

    def handle(self, *args, **options):
        # 1. Ensure the default site is set correctly for localhost
        site, created = Site.objects.get_or_create(id=1)
        site.domain = 'localhost:8000'
        site.name = 'Synthetix Local'
        site.save()

        self.stdout.write(self.style.SUCCESS(f"Site configured: {site.domain}"))

        # 2. Configure Google
        google_id = os.getenv('GOOGLE_CLIENT_ID', 'your-placeholder-google-id')
        google_secret = os.getenv('GOOGLE_CLIENT_SECRET', 'your-placeholder-google-secret')
        
        google_app, created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google Login',
                'client_id': google_id,
                'secret': google_secret,
            }
        )
        google_app.sites.add(site)
        
        self.stdout.write(self.style.SUCCESS(f"Google SocialApp {'created' if created else 'updated'}"))
