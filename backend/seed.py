# backend/seed.py
import os
import django
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")  # adjust if your settings module path is different
django.setup()

from subscriptions.models import Subscription  # import your Subscription model
from django.contrib.auth import get_user_model

User = get_user_model()

def run():
    try:
        user = User.objects.get(owner_id=5)
    except User.DoesNotExist:
        print("❌ User with id=5 does not exist. Please create that user first.")
        return

    # Sample subscriptions
    subscriptions = [
        {
            "service_name": "Netflix",
            "cost": 15.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=90),
            "is_active": True,
            "category": "streaming",
            "has_free_trial": False,
            "notes": "Family plan"
        },
        {
            "service_name": "Spotify",
            "cost": 9.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=200),
            "is_active": True,
            "category": "streaming",
            "has_free_trial": True,
            "trial_end_date": date.today() - timedelta(days=170),
        },
        {
            "service_name": "Adobe Creative Cloud",
            "cost": 52.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=60),
            "is_active": True,
            "category": "productivity",
        },
        {
            "service_name": "Xbox Game Pass",
            "cost": 14.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=120),
            "is_active": True,
            "category": "gaming",
        },
        {
            "service_name": "AWS Free Tier",
            "cost": 0.00,
            "billing_cycle": "custom",
            "custom_interval_unit": "months",
            "custom_interval_value": 12,
            "start_date": date.today() - timedelta(days=365),
            "is_active": False,
            "category": "cloud",
            "notes": "Free credits expired"
        },
        {
            "service_name": "Coursera Plus",
            "cost": 59.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=40),
            "is_active": True,
            "category": "education",
        },
        {
            "service_name": "Gym Membership",
            "cost": 120.00,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=10),
            "is_active": True,
            "category": "fitness",
        },
        {
            "service_name": "Microsoft 365",
            "cost": 99.99,
            "billing_cycle": "yearly",
            "start_date": date.today() - timedelta(days=300),
            "is_active": True,
            "category": "productivity",
        },
        {
            "service_name": "YouTube Premium",
            "cost": 11.99,
            "billing_cycle": "monthly",
            "start_date": date.today() - timedelta(days=15),
            "is_active": True,
            "category": "streaming",
        },
        {
            "service_name": "Custom SaaS Tool",
            "cost": 25.00,
            "billing_cycle": "custom",
            "custom_interval_unit": "days",
            "custom_interval_value": 45,
            "start_date": date.today() - timedelta(days=90),
            "is_active": True,
            "category": "custom",
            "custom_category": "Work Tools"
        },
    ]

    for sub in subscriptions:
        obj, created = Subscription.objects.get_or_create(
            user=user,
            service_name=sub["service_name"],
            defaults=sub
        )
        if created:
            print(f"✅ Created subscription: {obj.service_name}")
        else:
            print(f"ℹ️ Subscription already exists: {obj.service_name}")

if __name__ == "__main__":
    run()
