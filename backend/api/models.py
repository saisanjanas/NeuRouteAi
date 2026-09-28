from django.db import models
from django.contrib.auth.models import User


class Vehicle(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="vehicle",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=50, unique=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    speed = models.FloatField(default=0)
    heading = models.FloatField(default=0)

    last_location_update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.registration_number


class HazardReport(models.Model):
    HAZARD_TYPES = [
        ("landslide", "Landslide"),
        ("flooding", "Flooding"),
        ("road_damage", "Road Damage"),
        ("fallen_tree", "Fallen Tree"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    hazard_type = models.CharField(max_length=30, choices=HAZARD_TYPES)
    description = models.TextField(blank=True)

    latitude = models.FloatField()
    longitude = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hazard_type} - {self.created_at}"


class Shipment(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Transit", "In Transit"),
        ("Delivered", "Delivered"),
        ("Delayed", "Delayed"),
    ]

    shipment_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )
    eta = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.shipment_id
