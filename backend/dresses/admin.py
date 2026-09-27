"""Django admin registration for the dresses app."""

from django.contrib import admin

from .models import Dress


@admin.register(Dress)
class DressAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_deleted", "created_at")
    list_filter = ("category", "is_deleted")
    search_fields = ("name", "description")
    list_editable = ("price", "stock")
    filter_horizontal = ()
    readonly_fields = ("created_at", "updated_at")
