from django.urls import path

from . import views

urlpatterns = [
    path("api/auth/register/", views.register, name="register"),
    path("api/auth/login/", views.login_view, name="login"),
    path("api/auth/me/", views.me, name="me"),
    path("api/match/find/", views.find_match, name="find_match"),
    path("api/match/status/", views.match_status, name="match_status"),
]

