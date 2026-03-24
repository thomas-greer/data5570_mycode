from django.contrib import admin
from .models import (
    Profile,
    Match,
    MatchMember,
    CheckIn,
    Message,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'goal_category', 'target_per_week', 'created_at')
    list_filter = ('goal_category', 'target_per_week', 'created_at')
    search_fields = ('user__username', 'user__email', 'display_name', 'goal_category')
    readonly_fields = ('created_at',)


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('category',)
    readonly_fields = ('id', 'created_at')


@admin.register(MatchMember)
class MatchMemberAdmin(admin.ModelAdmin):
    list_display = ('match', 'user')
    search_fields = ('user__username', 'match__category')


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ('user', 'match', 'checkin_date', 'result', 'created_at')
    list_filter = ('result', 'checkin_date', 'created_at')
    search_fields = ('user__username', 'match__category')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'checkin_date'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('match', 'sender', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('sender__username', 'match__category', 'content')
    readonly_fields = ('created_at',)
