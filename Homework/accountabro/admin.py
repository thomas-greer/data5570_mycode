from django.contrib import admin
from .models import (
    Profile,
    GoalCategory,
    UserGoal,
    MatchRequest,
    Match,
    MatchMember,
    CheckIn,
    Block,
    Report,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'timezone', 'onboarding_complete', 'is_available_for_matching', 'created_at')
    list_filter = ('onboarding_complete', 'is_available_for_matching', 'timezone', 'created_at')
    search_fields = ('user__username', 'user__email', 'display_name', 'bio')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'display_name', 'timezone', 'bio')
        }),
        ('Status', {
            'fields': ('onboarding_complete', 'is_available_for_matching')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(GoalCategory)
class GoalCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_sensitive')
    list_filter = ('is_sensitive',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserGoal)
class UserGoalAdmin(admin.ModelAdmin):
    list_display = ('profile', 'category', 'target_per_week', 'visibility', 'created_at')
    list_filter = ('category', 'visibility', 'target_per_week', 'created_at')
    search_fields = ('profile__user__username', 'profile__display_name', 'category__name')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Goal Information', {
            'fields': ('profile', 'category', 'target_per_week', 'visibility')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(MatchRequest)
class MatchRequestAdmin(admin.ModelAdmin):
    list_display = ('profile', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('profile__user__username', 'profile__display_name', 'category__name')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Match Request Information', {
            'fields': ('id', 'profile', 'category', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'status', 'created_at', 'ended_at', 'end_reason')
    list_filter = ('status', 'category', 'created_at', 'ended_at')
    search_fields = ('category__name', 'end_reason')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Match Information', {
            'fields': ('id', 'category', 'status')
        }),
        ('End Information', {
            'fields': ('ended_at', 'end_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(MatchMember)
class MatchMemberAdmin(admin.ModelAdmin):
    list_display = ('match', 'profile', 'joined_at')
    list_filter = ('joined_at',)
    search_fields = ('match__category__name', 'profile__user__username', 'profile__display_name')
    readonly_fields = ('joined_at',)
    fieldsets = (
        ('Membership Information', {
            'fields': ('match', 'profile', 'joined_at')
        }),
    )


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ('profile', 'category', 'match', 'checkin_date', 'result', 'created_at')
    list_filter = ('result', 'category', 'checkin_date', 'created_at')
    search_fields = ('profile__user__username', 'profile__display_name', 'category__name', 'note')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'checkin_date'
    fieldsets = (
        ('Check-In Information', {
            'fields': ('id', 'match', 'profile', 'category', 'checkin_date', 'result', 'note')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('blocker', 'blocked', 'created_at')
    list_filter = ('created_at',)
    search_fields = (
        'blocker__user__username',
        'blocker__display_name',
        'blocked__user__username',
        'blocked__display_name'
    )
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Block Information', {
            'fields': ('blocker', 'blocked', 'created_at')
        }),
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reported', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = (
        'reporter__user__username',
        'reporter__display_name',
        'reported__user__username',
        'reported__display_name',
        'reason',
        'details'
    )
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Report Information', {
            'fields': ('reporter', 'reported', 'reason', 'details')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
