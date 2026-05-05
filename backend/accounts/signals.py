from django.db.models.signals import post_save
from django.dispatch import receiver
from allauth.socialaccount.signals import social_account_added
import logging
import requests
from django.core.files.base import ContentFile
from .models import CustomerProfile, SellerProfile, User

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Role.SELLER:
            SellerProfile.objects.create(user=instance, store_name=f"Store_{instance.id}")
        elif instance.role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(user=instance)


@receiver(social_account_added)
def save_social_avatar(request, socialaccount, **kwargs):
    """
    Fetch and save profile picture from social provider (e.g. Google)
    """
    user = socialaccount.user
    
    # We only auto-fill avatars for customers
    if user.role != User.Role.CUSTOMER:
        return

    avatar_url = None
    if socialaccount.provider == 'google':
        avatar_url = socialaccount.extra_data.get('picture')
    
    if avatar_url:
        profile, _ = CustomerProfile.objects.get_or_create(user=user)
        if not profile.avatar:
            try:
                response = requests.get(avatar_url, timeout=10)
                if response.status_code == 200:
                    file_name = f"avatar_{user.id}.jpg"
                    profile.avatar.save(file_name, ContentFile(response.content), save=True)
            except Exception as e:
                logger.exception("Error fetching social avatar: %s", e)
