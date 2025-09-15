from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema    
from decimal import Decimal
from .models import Subscription
from .serializers import SubscriptionSerializer

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

# The first line is just for documentation
@extend_schema(summary="Who am I", tags=["Auth"])
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({"id": user.id, "username": user.username, "email": user.email})


@extend_schema(summary="Register a user", tags=["Auth"])
@api_view(["POST"])
@permission_classes([AllowAny])   # anyone can call register
def register(request):
    data = request.data
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if not email or not username or not password:
        return Response(
            {"detail": "Email, username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "Username already taken."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "Email already registered."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"id": user.id, "username": user.username, "email": user.email},
        status=status.HTTP_201_CREATED
    )

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        # Include ALL user's subscriptions by default
        qs = Subscription.objects.filter(owner=self.request.user)
        
        # Only show active ones if specifically requested
        if self.request.query_params.get("active_only") == "1":
            qs = qs.filter(is_active=True)
        
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        # By default this is only the active subscriptions. Change it in get_queryset()
        # Pass ?include_inactive=1 to include inactive too 
        # subscriptions = self.get_queryset()
        
        subscriptions = Subscription.objects.filter(owner=self.request.user, is_active=True)

        #  Counts (efficient aggregation)
        counts = subscriptions.aggregate(
            total_count=Count("id"),
            monthly_count=Count("id", filter=Q(billing_cycle="monthly")),
            yearly_count=Count("id",  filter=Q(billing_cycle="yearly")),
            custom_count=Count("id",  filter=Q(billing_cycle="custom")),
        )

        #  Cost totals & normalized monthly spend 
        monthly_equivalent_total = Decimal("0")
        monthly_total = Decimal("0")
        yearly_total = Decimal("0")

        for subscription in subscriptions.only(
            "cost", "billing_cycle", "custom_interval_unit", "custom_interval_value"
        ):
            cost = subscription.cost or Decimal("0")

            if subscription.billing_cycle == "monthly":
                monthly_total += cost
                yearly_total  += cost * Decimal("12")
                monthly_equivalent_total += cost

            elif subscription.billing_cycle == "yearly":
                yearly_total  += cost
                monthly_share = cost / Decimal("12")
                monthly_total += monthly_share
                monthly_equivalent_total += monthly_share

            else:  # custom
                if subscription.custom_interval_unit == "months":
                    monthly_share = cost / Decimal(subscription.custom_interval_value)
                else:  # days → approximate month
                    monthly_share = cost * Decimal("30.44") / Decimal(subscription.custom_interval_value)

                monthly_total += monthly_share
                yearly_total  += monthly_share * Decimal("12")
                monthly_equivalent_total += monthly_share

        return Response({
            # counts
            "total_subscriptions": counts["total_count"],
            "monthly_subscriptions": counts["monthly_count"],
            "yearly_subscriptions": counts["yearly_count"],
            "custom_subscriptions": counts["custom_count"],

            # spend (strings to avoid float issues in JSON)
            "raw_monthly_total": f"{monthly_total:.2f}",           # sum of all subs expressed as monthly spend
            "raw_yearly_total":  f"{yearly_total:.2f}",            # same set expressed as yearly spend
            "normalized_monthly_total": f"{monthly_equivalent_total:.2f}",  # alias for monthly_equivalent
        })