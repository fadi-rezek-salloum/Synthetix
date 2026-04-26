from django.db.models.signals import post_save
from django.dispatch import receiver
from intelligence.services import AIService

from .models import Product, ProductImage


@receiver(post_save, sender=ProductImage)
def trigger_ai_enrichment(sender, instance, created, **kwargs):
    product = instance.product

    if not product.ai_description or created:
        ai = AIService()

        image_paths = [img.image.path for img in product.images.all()]

        data = ai.generate_fashion_meta(product, image_paths)

        if data:
            Product.objects.filter(pk=product.pk).update(
                ai_description=data.get("seo_description"), ai_style_tags=data.get("seo_tags")
            )
