"""
URL routes for the dresses app.
"""

from django.urls import path
from .views import DressListCreateView, DressDetailView, restore_dress

urlpatterns = [
    path("", DressListCreateView.as_view(), name="dress-list-create"),
    path("<int:pk>/", DressDetailView.as_view(), name="dress-detail"),
    path("<int:pk>/restore/", restore_dress, name="dress-restore"),
]