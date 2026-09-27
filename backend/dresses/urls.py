"""
URL routes for the dresses app.

Routes:
    GET    /                  — list + create (DressListCreateView)
    POST   /                  — create
    GET    /<id>/             — retrieve
    PUT    /<id>/             — full update
    PATCH  /<id>/             — partial update
    DELETE /<id>/             — soft delete (add ?hard=true for permanent)
    POST   /<id>/restore/     — restore a soft-deleted dress
"""

from django.urls import path

from .views import DressListCreateView, DressDetailView, restore_dress

urlpatterns = [
    path("", DressListCreateView.as_view(), name="dress-list-create"),
    path("<int:pk>/", DressDetailView.as_view(), name="dress-detail"),
    path("<int:pk>/restore/", restore_dress, name="dress-restore"),
]
