import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Match, MatchMember, Profile


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


@csrf_exempt
@require_http_methods(["POST"])
def find_match(request):
    user = _user_from_request(request)
    if not user:
        return JsonResponse({"detail": "not authenticated"}, status=401)

    body = _json_body(request)
    goal_category = (body.get("goal_category") or "").strip()
    target_per_week = body.get("target_per_week")
    if not goal_category:
        return JsonResponse({"detail": "goal_category is required"}, status=400)

    try:
        target_per_week = int(target_per_week)
    except (TypeError, ValueError):
        target_per_week = 0
    if target_per_week <= 0:
        target_per_week = 1

    with transaction.atomic():
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.goal_category = goal_category
        profile.target_per_week = target_per_week
        profile.save(update_fields=["goal_category", "target_per_week"])

        existing_membership = (
            MatchMember.objects.select_related("match")
            .filter(user=user, match__status=Match.Status.ACTIVE, match__category=goal_category)
            .first()
        )
        if existing_membership:
            active_match = existing_membership.match
        else:
            open_match = None
            for candidate in Match.objects.filter(
                status=Match.Status.ACTIVE,
                category=goal_category,
            ).order_by("created_at"):
                member_user_ids = list(
                    MatchMember.objects.filter(match=candidate, user__isnull=False).values_list("user_id", flat=True)
                )
                if user.id in member_user_ids:
                    open_match = candidate
                    break
                if len(member_user_ids) < 2:
                    open_match = candidate
                    break

            if open_match is None:
                open_match = Match.objects.create(
                    category=goal_category,
                    status=Match.Status.ACTIVE,
                )

            MatchMember.objects.get_or_create(match=open_match, user=user)
            active_match = open_match

        member_usernames = list(
            MatchMember.objects.filter(match=active_match, user__isnull=False)
            .exclude(user=user)
            .values_list("user__username", flat=True)
        )
        is_matched = len(member_usernames) > 0

    return JsonResponse(
        {
            "match_id": str(active_match.id),
            "category": active_match.category,
            "status": "matched" if is_matched else "waiting",
            "partner_name": member_usernames[0] if is_matched else None,
        }
    )


@require_http_methods(["GET"])
def match_status(request):
    user = _user_from_request(request)
    if not user:
        return JsonResponse({"detail": "not authenticated"}, status=401)

    profile = Profile.objects.filter(user=user).first()
    if not profile or not (profile.goal_category or "").strip():
        return JsonResponse(
            {
                "match_id": None,
                "category": None,
                "status": "none",
                "partner_name": None,
            }
        )

    goal = profile.goal_category.strip()
    membership = (
        MatchMember.objects.select_related("match")
        .filter(user=user, match__status=Match.Status.ACTIVE, match__category=goal)
        .first()
    )
    if not membership:
        return JsonResponse(
            {
                "match_id": None,
                "category": goal,
                "status": "waiting",
                "partner_name": None,
            }
        )

    active_match = membership.match
    other_names = list(
        MatchMember.objects.filter(match=active_match, user__isnull=False)
        .exclude(user=user)
        .values_list("user__username", flat=True)
    )
    is_matched = len(other_names) > 0
    return JsonResponse(
        {
            "match_id": str(active_match.id),
            "category": active_match.category,
            "status": "matched" if is_matched else "waiting",
            "partner_name": other_names[0] if is_matched else None,
        }
    )
