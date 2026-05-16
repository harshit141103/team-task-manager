from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "name", "avatar_url", "job_title", "timezone", "date_joined")
        read_only_fields = ("id", "email", "date_joined")


class PublicUserSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "name", "avatar_url", "job_title", "initials")

    def get_initials(self, obj) -> str:
        return "".join(part[0:1] for part in obj.name.split()[:2]).upper() or obj.email[0:1].upper()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], min_length=10)

    class Meta:
        model = User
        fields = ("id", "email", "name", "password")
        read_only_fields = ("id",)

    def validate_email(self, value):
        normalized = value.lower().strip()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        user = User.objects.create_user(username=email, email=email, password=password, **validated_data)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
