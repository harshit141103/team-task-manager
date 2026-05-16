from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError


def validate_attachment(file) -> None:
    extension = Path(file.name).suffix.lower().lstrip(".")
    if extension not in settings.ALLOWED_ATTACHMENT_EXTENSIONS:
        raise ValidationError(f"Unsupported file type: .{extension}")
    if file.size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
        raise ValidationError(f"Attachment exceeds the {max_mb}MB limit.")
