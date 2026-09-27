"""
Views for the dresses app.

Permission model:
  - Read (GET) is open to everyone — unauthenticated visitors and customers
    can browse dresses.
  - Create, Update, and Delete require admin privileges (IsAdminUser).

JWT authentication is handled by SimpleJWT. The token endpoints live in
the root urls.py; this module only contains the dress CRUD views.
"""

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Dress
from .serializers import DressSerializer


class DressListCreateView(generics.ListCreateAPIView):
    """List all active (non-deleted) dresses or create a new one.

    GET /api/dresses/                — list active dresses (public, no auth needed)
    POST /api/dresses/               — create a new dress (admin only)

    Query parameters (all optional):
        search       — case-insensitive match on name or description
        category     — exact category match (e.g. ?category=Summer)
        size         — dresses that include this size (e.g. ?size=M)
        color        — dresses that include this color (e.g. ?color=Red)
        min_price    — minimum price (inclusive)
        max_price    — maximum price (inclusive)
        include_deleted — set to "true" to also include soft-deleted dresses
        ordering     — "price", "-price", "name", "-name", "-created_at"
    """

    serializer_class = DressSerializer

    def get_permissions(self):
        """Allow anyone to list (GET), but only admins to create (POST)."""
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Dress.objects.all()

        # Exclude soft-deleted by default unless explicitly requested.
        include_deleted = self.request.query_params.get("include_deleted", "false")
        if include_deleted.lower() != "true":
            queryset = queryset.filter(is_deleted=False)

        # Search across name and description.
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Category filter (exact match).
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Size filter — match dresses whose sizes JSON list contains the value.
        size = self.request.query_params.get("size")
        if size:
            queryset = queryset.filter(sizes__contains=[size])

        # Color filter.
        color = self.request.query_params.get("color")
        if color:
            queryset = queryset.filter(colors__contains=[color])

        # Price range filters.
        min_price = self.request.query_params.get("min_price")
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = self.request.query_params.get("max_price")
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # Ordering.
        ordering = self.request.query_params.get("ordering", "-created_at")
        allowed_orderings = {"price", "-price", "name", "-name", "-created_at", "created_at"}
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)

        return queryset


class DressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a single dress.

    GET    /api/dresses/<id>/   — retrieve a dress (public)
    PUT    /api/dresses/<id>/   — full update (admin only)
    PATCH  /api/dresses/<id>/   — partial update (admin only)
    DELETE /api/dresses/<id>/   — soft-delete (admin only)

    To perform a HARD delete (remove the row entirely), send
    DELETE /api/dresses/<id>/?hard=true
    """

    serializer_class = DressSerializer

    def get_permissions(self):
        """Read access is public; write/delete access is admin-only."""
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        # Allow retrieval of any dress (including soft-deleted) by ID.
        return Dress.objects.all()

    def destroy(self, request, *args, **kwargs):
        """Override delete to support soft and hard deletion."""
        instance = self.get_object()
        hard = request.query_params.get("hard", "false").lower() == "true"

        if hard:
            instance.delete()
            return Response(
                {"detail": "Dress permanently deleted.", "hard_delete": True},
                status=status.HTTP_204_NO_CONTENT,
            )
        else:
            instance.is_deleted = True
            instance.save(update_fields=["is_deleted", "updated_at"])
            return Response(
                {"detail": "Dress soft-deleted.", "hard_delete": False},
                status=status.HTTP_200_OK,
            )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def restore_dress(request, pk):
    """Restore a soft-deleted dress (admin only).

    POST /api/dresses/<id>/restore/
    """
    try:
        dress = Dress.objects.get(pk=pk)
    except Dress.DoesNotExist:
        return Response(
            {"detail": "Dress not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    dress.is_deleted = False
    dress.save(update_fields=["is_deleted", "updated_at"])
    serializer = DressSerializer(dress)
    return Response(serializer.data, status=status.HTTP_200_OK)
