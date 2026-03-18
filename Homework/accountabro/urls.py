from django.urls import path

from . import views

urlpatterns = [
    path("api/auth/register/", views.register, name="register"),
    path("api/auth/login/", views.login_view, name="login"),
    path("api/auth/me/", views.me, name="me"),
]

