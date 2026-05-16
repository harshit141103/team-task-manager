from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieOrHeaderJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "apps.users.authentication.CookieOrHeaderJWTAuthentication"
    name = "JWTAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT access token supplied via Authorization header or secure ttm_access cookie.",
        }
