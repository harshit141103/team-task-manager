import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=160)
    avatar_url = models.URLField(blank=True)
    job_title = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["name"]),
        ]

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        if not self.name:
            self.name = self.get_full_name() or self.email.split("@")[0]
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name or self.email
