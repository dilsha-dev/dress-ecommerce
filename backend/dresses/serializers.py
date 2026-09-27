"""
Serializers for the dresses app.

The ``DressSerializer`` converts ``Dress`` model instances to and from
JSON, making them consumable by the React frontend through the REST API.
It exposes every field the storefront and admin dashboard need, including
the computed ``in_stock`` and ``is_low_stock`` read-only helpers.
"""

from rest_framework import serializers

from .models import Dress


class DressSerializer(serializers.ModelSerializer):
    """Serializer for the ``Dress`` model."""

    in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Dress
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "sizes",
            "colors",
            "stock",
            "image_url",
            "gallery",
            "is_deleted",
            "in_stock",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "in_stock", "is_low_stock"]

    def validate_price(self, value):
        """Ensure the price is a positive number."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_stock(self, value):
        """Ensure stock is not negative."""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def validate_sizes(self, value):
        """Ensure sizes is a list of non-empty strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Sizes must be a list.")
        for size in value:
            if not isinstance(size, str) or not size.strip():
                raise serializers.ValidationError("Each size must be a non-empty string.")
        return value

    def validate_colors(self, value):
        """Ensure colors is a list of non-empty strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Colors must be a list.")
        for color in value:
            if not isinstance(color, str) or not color.strip():
                raise serializers.ValidationError("Each color must be a non-empty string.")
        return value
