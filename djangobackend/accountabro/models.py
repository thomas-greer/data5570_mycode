import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    """
    Extra info beyond Django's built-in User.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=40, blank=True)
    timezone = models.CharField(max_length=64, default="America/Denver")
    bio = models.CharField(max_length=240, blank=True)

    # Helpful for onboarding / safety
    onboarding_complete = models.BooleanField(default=False)
    is_available_for_matching = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name or self.user.username


class GoalCategory(models.Model):
    """
    "Gym", "Eat better", "Porn recovery", etc.
    Keep this high-level—don’t store explicit sexual content.
    """
    slug = models.SlugField(unique=True)  # e.g. "gym", "nutrition", "porn-recovery"
    name = models.CharField(max_length=60)
    is_sensitive = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class UserGoal(models.Model):
    """
    A user opts into a category and sets a commitment.
    """
    class Visibility(models.TextChoices):
        PRIVATE = "private", "Private"
        PARTNER_ONLY = "partner", "Partner only"

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="goals")
    category = models.ForeignKey(GoalCategory, on_delete=models.PROTECT, related_name="user_goals")

    # How often they want to do it (simple + flexible)
    target_per_week = models.PositiveSmallIntegerField(default=3)
    visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PARTNER_ONLY)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["profile", "category"], name="unique_goal_per_profile_category")
        ]

    def __str__(self):
        return f"{self.profile} -> {self.category}"


class MatchRequest(models.Model):
    """
    A user enters the queue to get randomly paired for a specific category.
    Your matching code can pick 2 PENDING requests for same category.
    """
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        MATCHED = "matched", "Matched"
        CANCELED = "canceled", "Canceled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="match_requests")
    category = models.ForeignKey(GoalCategory, on_delete=models.PROTECT, related_name="match_requests")

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["category", "status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.profile} queue {self.category} ({self.status})"


class Match(models.Model):
    """
    The actual accountability pairing (or small group later).
    """
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    category = models.ForeignKey(GoalCategory, on_delete=models.PROTECT, related_name="matches")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)

    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    end_reason = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.category} match ({self.status})"


class MatchMember(models.Model):
    """
    Members of a match (start with 2, but this supports groups later).
    """
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="members")
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="match_memberships")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["match", "profile"], name="unique_member_per_match"),
        ]

    def __str__(self):
        return f"{self.profile} in {self.match}"


class CheckIn(models.Model):
    """
    A progress log tied to a match + category.
    Keep it simple; don’t force “gym-only” fields.
    """
    class Result(models.TextChoices):
        DID_IT = "did_it", "Did it"
        PARTIAL = "partial", "Partial"
        MISSED = "missed", "Missed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="checkins")
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="checkins")
    category = models.ForeignKey(GoalCategory, on_delete=models.PROTECT, related_name="checkins")

    # “Daily” check-in vibe:
    checkin_date = models.DateField(default=timezone.localdate)

    result = models.CharField(max_length=10, choices=Result.choices)
    note = models.CharField(max_length=280, blank=True)  # keep short to avoid oversharing

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["match", "checkin_date"]),
            models.Index(fields=["profile", "checkin_date"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["match", "profile", "checkin_date"],
                name="one_checkin_per_day_per_match"
            )
        ]

    def __str__(self):
        return f"{self.profile} {self.category} {self.checkin_date} {self.result}"


class Block(models.Model):
    """
    Safety feature: prevent matching with someone.
    """
    blocker = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="blocks_made")
    blocked = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="blocks_received")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_block_pair")
        ]

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"


class Report(models.Model):
    """
    Optional: simple reporting pipeline.
    """
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reports_made")
    reported = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reports_received")
    reason = models.CharField(max_length=80)
    details = models.TextField(blank=True)  # still keep moderation in mind
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report: {self.reporter} -> {self.reported} ({self.reason})"

# Create your models here.
