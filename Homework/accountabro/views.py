import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Profile


def _json_body(request):
    try:
        raw = request.body.decode("utf-8") if request.body else ""
        return json.loads(raw) if raw else {}
    except Exception:
        return {}


def _token_for_user(user):
    return signing.dumps({"uid": user.id}, salt="accountabro.auth")


def _user_from_request(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    try:
        payload = signing.loads(token, salt="accountabro.auth", max_age=60 * 60 * 24 * 30)
    except Exception:
        return None
    uid = payload.get("uid")
    if not uid:
        return None
    User = get_user_model()
    try:
        return User.objects.get(id=uid)
    except User.DoesNotExist:
        return None


def _user_payload(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return {
        "id": user.id,
        "username": user.get_username(),
        "display_name": profile.display_name,
    }


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    body = _json_body(request)
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    display_name = body.get("display_name") or ""

    if not username or not password:
        return JsonResponse({"detail": "username and password required"}, status=400)

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "username already taken"}, status=409)

    user = User.objects.create_user(username=username, password=password)
    profile, _ = Profile.objects.get_or_create(user=user)
    if display_name:
        profile.display_name = display_name
        profile.save(update_fields=["display_name"])

    token = _token_for_user(user)
    return JsonResponse({"token": token, "user": _user_payload(user)})


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    body = _json_body(request)
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    user = authenticate(request, username=username, password=password)
    if not user:
        return JsonResponse({"detail": "invalid credentials"}, status=401)

    token = _token_for_user(user)
    return JsonResponse({"token": token, "user": _user_payload(user)})


@require_http_methods(["GET"])
def me(request):
    user = _user_from_request(request)
    if not user:
        return JsonResponse({"detail": "not authenticated"}, status=401)
    return JsonResponse({"user": _user_payload(user)})
