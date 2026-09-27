"""
Root URL configuration for the backend project.

The Django admin is available at ``/admin/`` and the dress CRUD API is
mounted at ``/api/dresses/``. JWT token endpoints are at ``/api/token/``
and ``/api/token/refresh/``. User registration is at ``/api/register/``.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from dresses.auth_views import RegisterView

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT authentication endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User registration
    path("api/register/", RegisterView.as_view(), name="register"),
    # Dress CRUD API
    path("api/dresses/", include("dresses.urls")),
]

# Serve media files in development.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
