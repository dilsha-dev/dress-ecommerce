"""
Serializers and views for user registration and JWT authentication using Django's built-in
User model with SimpleJWT.
"""

from django.contrib.auth.models import User
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Add any email addresses that should automatically become admins upon login
ADMIN_EMAILS = ["dilshapk57@gmail.com"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that auto-promotes admin emails and returns user roles."""

    def validate(self, attrs):
        data = super().validate(attrs)

        # Auto-promote user to admin if their email matches ADMIN_EMAILS
        if self.user.email in ADMIN_EMAILS and not self.user.is_staff:
            self.user.is_staff = True
            self.user.is_superuser = True
            self.user.save()

        is_admin = self.user.is_staff or self.user.is_superuser
        full_name = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username

        data["email"] = self.user.email
        data["role"] = "admin" if is_admin else "customer"
        data["is_staff"] = self.user.is_staff
        data["full_name"] = full_name

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterView(APIView):
    """Public endpoint for creating a new user account."""

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