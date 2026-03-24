import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=40, blank=True)
    goal_category = models.CharField(max_length=60, blank=True)
    target_per_week = models.PositiveSmallIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name or self.user.username


class Match(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"
        BLOCKED = "blocked", "Blocked"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=60)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} match ({self.status})"


class MatchMember(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="match_memberships",
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["match", "user"], name="unique_member_per_match"),
        ]

    def __str__(self):
        return f"{self.user} in {self.match}"


class CheckIn(models.Model):
    class Result(models.TextChoices):
        DID_IT = "did_it", "Did it"
        PARTIAL = "partial", "Partial"
        MISSED = "missed", "Missed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="checkins")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checkins",
        null=True,
        blank=True,
    )
    checkin_date = models.DateField(default=timezone.localdate)
    result = models.CharField(max_length=10, choices=Result.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["match", "checkin_date"]),
            models.Index(fields=["user", "checkin_date"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["match", "user", "checkin_date"],
                name="one_checkin_per_day_per_match"
            )
        ]

    def __str__(self):
        return f"{self.user} {self.match} {self.checkin_date} {self.result}"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} @ {self.created_at}"
