"""
Root URL configuration for the backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView
from dresses.auth_views import RegisterView, CustomTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT authentication endpoints
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User registration
    path("api/register/", RegisterView.as_view(), name="register"),
    # Dress CRUD API
    path("api/dresses/", include("dresses.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
