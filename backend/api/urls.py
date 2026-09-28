from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("auth/login", views.login),
    path("shipments/<int:shipment_id>/status", views.shipment_status),
]
