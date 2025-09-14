# subscriptions/serializers.py
from rest_framework import serializers
from .models import Subscription
from django.utils import timezone
from datetime import date, timedelta
from calendar import monthrange

def add_months(d: date, months: int) -> date:
    y = d.year + (d.month - 1 + months) // 12
    m = (d.month - 1 + months) % 12 + 1
    last = monthrange(y, m)[1]
    return date(y, m, min(d.day, last))

class SubscriptionSerializer(serializers.ModelSerializer):
    in_trial_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id", "service_name", "cost",
            "billing_cycle", "custom_interval_unit", "custom_interval_value",
            "start_date", "renewal_date", "is_active",
            "category", "custom_category",
            "has_free_trial", "trial_end_date", "in_trial_now",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "renewal_date"]

    def validate_cost(self, cost):
        if cost is None or cost <= 0:
                raise serializers.ValidationError("Cost must be positive.")
        return cost
    
    def validate(self, data):
        # Dates
        start = data.get("start_date", getattr(self.instance, "start_date", None))
        if start is None:
            raise serializers.ValidationError({"start_date": "Start date is required."})
        
        
        # Trial Subscription
        has_trial = data.get("has_free_trial", getattr(self.instance, "has_free_trial", False))
        trial_end = data.get("trial_end_date", getattr(self.instance, "trial_end_date", None))
        if has_trial and not trial_end:
            raise serializers.ValidationError({"trial_end_date": "Required when has_free_trial is true."})
        if not has_trial and trial_end:
            raise serializers.ValidationError({"trial_end_date": "Must be empty when has_free_trial is false."})
        if trial_end and trial_end < start:
            raise serializers.ValidationError({"trial_end_date": "Cannot be before start_date."})

        # Billing Cycle
        cycle = data.get("billing_cycle", getattr(self.instance, "billing_cycle", "monthly"))
        
        # custom unit days/months
        unit  = data.get("custom_interval_unit",  getattr(self.instance, "custom_interval_unit",  None)) 
        #  Eg: every 14 days/3 months
        value = data.get("custom_interval_value", getattr(self.instance, "custom_interval_value", None))
        
        if cycle == "custom":
            if not unit or not value:
                raise serializers.ValidationError({
                    "custom_interval_unit": "Required when billing_cycle is 'custom'.",
                    "custom_interval_value": "Required when billing_cycle is 'custom'.",
                })
            if unit not in {"days", "months"}:
                raise serializers.ValidationError({"custom_interval_unit": "Must be 'days' or 'months'."})
            if value <= 0:
                raise serializers.ValidationError({"custom_interval_value": "Must be a positive integer."})
        else:
            if unit or value:
                raise serializers.ValidationError({
                    "custom_interval_unit": "Use only when billing_cycle is 'custom'.",
                    "custom_interval_value": "Use only when billing_cycle is 'custom'.",
                })
                
        # Category
        category = data.get("category", getattr(self.instance, "category", "streaming"))
        custom_cat = data.get("custom_category", getattr(self.instance, "custom_category", ""))
        if category == "custom":
            if not custom_cat or not custom_cat.strip():
                raise serializers.ValidationError({"custom_category": "Provide a name when category is 'custom'."})
        else:
            if custom_cat:
                raise serializers.ValidationError({"custom_category": "Use only when category is 'custom'."})

        return data
    
    def _compute_renewal(self, start, cycle, unit, value, has_trial, trial_end):
        if has_trial and trial_end:
            return trial_end + timedelta(days=1)  # first paid day after trial
        if cycle == "monthly":
            return add_months(start, 1)
        if cycle == "yearly":
            return add_months(start, 12)
        # custom
        if unit == "months":
            return add_months(start, value)
        return start + timedelta(days=value)

    # Runs when a new subscription is created
    def create(self, validated):
        start     = validated["start_date"]
        cycle     = validated["billing_cycle"]
        unit      = validated.get("custom_interval_unit")
        value     = validated.get("custom_interval_value")
        has_trial = validated.get("has_free_trial", False)
        trial_end = validated.get("trial_end_date")

        validated["renewal_date"] = self._compute_renewal(start, cycle, unit, value, has_trial, trial_end)
        return super().create(validated)

    def update(self, instance, validated):
        start = validated.get("start_date", instance.start_date)
        cycle = validated.get("billing_cycle", instance.billing_cycle)
        unit  = validated.get("custom_interval_unit",  instance.custom_interval_unit)
        value = validated.get("custom_interval_value", instance.custom_interval_value)
        has_trial = validated.get("has_free_trial", instance.has_free_trial)
        trial_end = validated.get("trial_end_date", instance.trial_end_date)

        validated["renewal_date"] = self._compute_renewal(start, cycle, unit, value, has_trial, trial_end)
        return super().update(instance, validated)