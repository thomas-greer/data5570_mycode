"""
Allow browser requests from Expo web (different port) to hit this API during dev.
Uses wildcard origin; fine for local dev when auth is Bearer tokens (not cookies).
"""


class CorsDevMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            from django.http import HttpResponse

            resp = HttpResponse(status=204)
            resp["Access-Control-Allow-Origin"] = "*"
            resp["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            resp["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            resp["Access-Control-Max-Age"] = "86400"
            return resp

        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response
