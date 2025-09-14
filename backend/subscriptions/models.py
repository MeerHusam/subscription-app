from django.db import models
from django.conf import settings
from datetime import date


BILLING_CHOICES = (("monthly", "Monthly"), ("yearly", "Yearly"), ("custom", "Custom"))
INTERVAL_UNIT_CHOICES = (("days", "Days"), ("months", "Months"))

CATEGORY_CHOICES = (
    ("streaming", "Streaming"),
    ("productivity", "Productivity"),
    ("gaming", "Gaming"),
    ("cloud", "Cloud / Dev"),
    ("education", "Education"),
    ("fitness", "Fitness/Health"),
    ("finance", "Finance"),
    ("custom", "Custom"),
)

# Create your models here.
class Subscription(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    
    service_name    = models.CharField(max_length=100)
    cost            = models.DecimalField(max_digits=9, decimal_places=2)  
    billing_cycle   = models.CharField(max_length=20, choices=BILLING_CHOICES, default="monthly")  # monthly|yearly|custom
    start_date      = models.DateField()
    renewal_date    = models.DateField()
    is_active       = models.BooleanField(default=True)
    notes           = models.TextField(blank=True, default="")
        
    # Categories
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default="streaming")
    custom_category = models.CharField(max_length=64, blank=True, default="")  # required if category='custom'

    # When billing cycle is custom
    custom_interval_unit  = models.CharField(max_length=10, choices=INTERVAL_UNIT_CHOICES, null=True, blank=True)
    custom_interval_value = models.PositiveSmallIntegerField(null=True, blank=True)

    # Trial Fields
    has_free_trial = models.BooleanField(default=False)
    trial_end_date = models.DateField(null=True, blank=True)  # last day of trial (billing begins next day)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["renewal_date", "id"]

    def __str__(self):
        return f"{self.service_name} ({self.owner})"

    @property
    def in_trial_now(self) -> bool:
        """Returns true if the subscription is currently in trial"""
        if not self.has_free_trial and not self.trial_end_date:  # No free trial
            return False
        today = date.today()
        return today <= self.trial_end_date    