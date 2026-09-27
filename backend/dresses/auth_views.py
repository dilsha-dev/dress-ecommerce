"""
Serializers and views for user registration using Django's built-in
User model with SimpleJWT for token-based authentication.

Endpoints (mounted in the root urls.py):
    POST /api/register/        — create a new user account
    POST /api/token/           — obtain a JWT access/refresh pair (login)
    POST /api/token/refresh/   — refresh an expired access token
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user registration — exposes the fields the React
    signup form sends: username, email, password, first_name, last_name."""

    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        """Ensure the email is not already registered."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Ensure the username is not already taken."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        """Create the user with a hashed password (never stored in plaintext)."""
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterView(APIView):
    """Public endpoint for creating a new user account.

    POST /api/register/

    Request body:
        {
            "username": "janedoe",
            "email": "jane@example.com",
            "password": "securepass123",
            "first_name": "Jane",
            "last_name": "Doe"
        }

    Returns the created user (without the password) and HTTP 201.
    New users are created as regular (non-staff, non-superuser) accounts.
    To make a user an admin, set ``is_staff = True`` or ``is_superuser = True``
    via the Django admin or shell.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "message": "Account created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )
