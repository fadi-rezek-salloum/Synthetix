from django.urls import path

from .views import BuyerChatbotView, ManualEnrichmentView

urlpatterns = [
    path("chat/buyer/", BuyerChatbotView.as_view(), name="buyer-chat"),
    path("vendor/enrich/", ManualEnrichmentView.as_view(), name="vendor-enrich"),
]
