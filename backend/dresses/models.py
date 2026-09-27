"""
Database models for the dresses app.

The ``Dress`` model stores a single dress product listing with all the
information the React storefront and admin dashboard need: name, price,
category, available sizes and colors, stock level, image URLs, and a
soft-delete flag.

Sizes and colors are stored as JSON-encodable ``JSONField`` lists so they
can hold an arbitrary number of values (e.g. ``["S", "M", "L", "XL"]``)
without needing additional join tables.  This mirrors the array columns
used by the Supabase/Postgres frontend and keeps the API contract
identical.
"""

from django.db import models


class Dress(models.Model):
    """A dress product listing."""

    class Category(models.TextChoices):
        EVENING = "Evening", "Evening"
        CASUAL = "Casual", "Casual"
        SUMMER = "Summer", "Summer"
        WEDDING = "Wedding", "Wedding"
        COCKTAIL = "Cocktail", "Cocktail"

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.CASUAL,
    )
    sizes = models.JSONField(default=list, blank=True)
    colors = models.JSONField(default=list, blank=True)
    stock = models.IntegerField(default=0)
    image_url = models.URLField(max_length=1000, blank=True, default="")
    gallery = models.JSONField(default=list, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Dress"
        verbose_name_plural = "Dresses"

    def __str__(self) -> str:
        return self.name

    @property
    def in_stock(self) -> bool:
        return self.stock > 0

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.stock <= 10
