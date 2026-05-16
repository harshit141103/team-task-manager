from django.conf import settings
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework import serializers
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.common.permissions import IsSelfOrAdmin
from apps.users.serializers import LoginSerializer, RegisterSerializer, UserSerializer


User = get_user_model()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


def set_token_cookies(response: Response, access: str | None = None, refresh: str | None = None) -> None:
    cookie_options = {
        "httponly": True,
        "secure": settings.JWT_COOKIE_SECURE,
        "samesite": "None" if settings.JWT_COOKIE_SECURE else "Lax",
        "path": "/",
    }
    if access:
        response.set_cookie("ttm_access", access, max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), **cookie_options)
    if refresh:
        response.set_cookie("ttm_refresh", refresh, max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), **cookie_options)


def clear_token_cookies(response: Response) -> None:
    response.delete_cookie("ttm_access", path="/")
    response.delete_cookie("ttm_refresh", path="/")


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        response = Response(data, status=status.HTTP_201_CREATED)
        set_token_cookies(response, data["access"], data["refresh"])
        return response


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        set_token_cookies(response, response.data.get("access"), response.data.get("refresh"))
        return response


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        if not data.get("refresh") and request.COOKIES.get("ttm_refresh"):
            data["refresh"] = request.COOKIES["ttm_refresh"]
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        set_token_cookies(response, response.data.get("access"), response.data.get("refresh"))
        return response


class LogoutView(APIView):
    @extend_schema(request=LogoutSerializer, responses={204: None})
    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get("ttm_refresh")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except (InvalidToken, TokenError):
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_token_cookies(response)
        return response


class UserMeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin]
    search_fields = ["name", "email"]
    ordering_fields = ["name", "email", "date_joined"]
    ordering = ["name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()
        return User.objects.filter(is_active=True).order_by("name")
