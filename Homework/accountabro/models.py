"""
Schema aligned with the course ER diagram.

USERS → Django's `auth.User` (user_id, username, password hash, date_joined, is_active).
Other tables live in this app with bigint-style PKs (BigAutoField).
"""

from django.conf import settings
from django.db import models
from django.utils import timezone


class GoalCategory(models.Model):
    """GOAL_CATEGORIES"""

    name = models.CharField(max_length=120, unique=True)

    class Meta:
        db_table = "goal_categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Profile(models.Model):
    """PROFILES — one row per user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="profile",
    )
    display_name = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "profiles"

    def __str__(self):
        return self.display_name or self.user.get_username()


class UserGoal(models.Model):
    """USER_GOALS — user selects a category and weekly target."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_goals",
    )
    category = models.ForeignKey(
        GoalCategory,
        on_delete=models.PROTECT,
        related_name="user_goals",
    )
    target_per_week = models.PositiveSmallIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_goals"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category"],
                name="unique_user_goal_per_category",
            ),
        ]

    def __str__(self):
        return f"{self.user} → {self.category}"


class Match(models.Model):
    """MATCHES — pairing bucket for a goal category."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"
        BLOCKED = "blocked", "Blocked"

    category = models.ForeignKey(
        GoalCategory,
        on_delete=models.PROTECT,
        related_name="matches",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "matches"

    def __str__(self):
        return f"{self.category} ({self.status})"


class MatchMember(models.Model):
    """MATCH_MEMBERS"""

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="match_memberships",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "match_members"
        constraints = [
            models.UniqueConstraint(fields=["match", "user"], name="unique_member_per_match"),
        ]

    def __str__(self):
        return f"{self.user} in match {self.match_id}"


class CheckIn(models.Model):
    """CHECK_INS — status is stored as varchar per diagram."""

    class Status(models.TextChoices):
        DID_IT = "did_it", "Did it"
        PARTIAL = "partial", "Partial"
        MISSED = "missed", "Missed"

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="checkins")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checkins",
    )
    checkin_date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=20, choices=Status.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "check_ins"
        indexes = [
            models.Index(fields=["match", "checkin_date"]),
            models.Index(fields=["user", "checkin_date"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["match", "user", "checkin_date"],
                name="one_checkin_per_day_per_match",
            ),
        ]

    def __str__(self):
        return f"{self.user} {self.checkin_date} {self.status}"


class Message(models.Model):
    """MESSAGES"""

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    content = models.TextField(max_length=4000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"

    def __str__(self):
        return f"{self.sender_id} @ {self.created_at}"
