from django.contrib import admin

from .models import (
    CheckIn,
    GoalCategory,
    Match,
    MatchMember,
    Message,
    Profile,
    UserGoal,
)


@admin.register(GoalCategory)
class GoalCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("user__username", "display_name")
    readonly_fields = ("created_at",)


@admin.register(UserGoal)
class UserGoalAdmin(admin.ModelAdmin):
    list_display = ("user", "category", "target_per_week", "is_active", "created_at")
    list_filter = ("is_active", "category", "created_at")
    search_fields = ("user__username", "category__name")
    readonly_fields = ("created_at",)


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "status", "created_at", "ended_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("category__name",)
    readonly_fields = ("created_at",)


@admin.register(MatchMember)
class MatchMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "match", "user", "joined_at")
    search_fields = ("user__username", "match__id")
    readonly_fields = ("joined_at",)


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ("user", "match", "checkin_date", "status", "created_at")
    list_filter = ("status", "checkin_date", "created_at")
    search_fields = ("user__username", "match__id")
    readonly_fields = ("created_at",)
    date_hierarchy = "checkin_date"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "match", "sender", "created_at")
    list_filter = ("created_at",)
    search_fields = ("sender__username", "content")
    readonly_fields = ("created_at",)
