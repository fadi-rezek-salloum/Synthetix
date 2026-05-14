from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.http import JsonResponse
from django.views.static import serve
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for Docker healthcheck"""
    return JsonResponse({"status": "ok"}, status=200)

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/catalog/", include("catalog.urls")),
    path("api/v1/intelligence/", include("intelligence.urls")),
    path("api/v1/orders/", include("orders.urls")),
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
