from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("auth/login", views.login),
    path("vehicles/<int:vehicle_id>/location", views.vehicle_location),
    path("shipments/<int:shipment_id>/status", views.shipment_status),
    path("reports", views.create_hazard_report),
]
