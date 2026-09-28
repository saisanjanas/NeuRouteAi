from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from .models import Vehicle, HazardReport, Shipment

from rest_framework.authtoken.models import Token

from .models import Vehicle, HazardReport, Shipment

import json


def health(request):
    return JsonResponse({
        "status": "ok",
        "service": "NeuRouteAi Django backend"
    })


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse(
            {"detail": "POST method required."},
            status=405
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400
        )

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse(
            {"detail": "Username and password are required."},
            status=400
        )

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return JsonResponse(
            {"detail": "Invalid username or password."},
            status=401
        )

    token, _ = Token.objects.get_or_create(user=user)

    vehicle_id = None

    try:
        vehicle_id = user.vehicle.id
    except Vehicle.DoesNotExist:
        pass

    return JsonResponse({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "vehicle_id": vehicle_id,
        }
    })


def get_authenticated_user(request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Token "):
        return None

    token_key = auth_header.split(" ", 1)[1].strip()

    if not token_key:
        return None

    try:
        token = Token.objects.select_related("user").get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None


@csrf_exempt
def vehicle_location(request, vehicle_id):
    if request.method != "POST":
        return JsonResponse(
            {"detail": "POST method required."},
            status=405
        )

    user = get_authenticated_user(request)

    if user is None:
        return JsonResponse(
            {"detail": "Authentication required."},
            status=401
        )

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
    except Vehicle.DoesNotExist:
        return JsonResponse(
            {"detail": "Vehicle not found."},
            status=404
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400
        )

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if latitude is None or longitude is None:
        return JsonResponse(
            {"detail": "latitude and longitude are required."},
            status=400
        )

    vehicle.latitude = latitude
    vehicle.longitude = longitude
    vehicle.speed = data.get("speed") or 0
    vehicle.heading = data.get("heading") or 0
    vehicle.last_location_update = timezone.now()
    vehicle.save()

    return JsonResponse({
        "message": "Vehicle location updated successfully.",
        "vehicle_id": vehicle.id,
        "latitude": vehicle.latitude,
        "longitude": vehicle.longitude,
        "speed": vehicle.speed,
        "heading": vehicle.heading,
        "updated_at": vehicle.last_location_update,
    })


@csrf_exempt
def hazard_report(request):
    if request.method != "POST":
        return JsonResponse(
            {"detail": "POST method required."},
            status=405
        )

    user = get_authenticated_user(request)

    if user is None:
        return JsonResponse(
            {"detail": "Authentication required."},
            status=401
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400
        )

    hazard_type = data.get("hazard_type")
    description = data.get("description", "")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    valid_types = dict(HazardReport.HAZARD_TYPES)

    if hazard_type not in valid_types:
        return JsonResponse(
            {
                "detail": "Invalid hazard type.",
                "allowed_types": list(valid_types.keys()),
            },
            status=400
        )

    if latitude is None or longitude is None:
        return JsonResponse(
            {"detail": "latitude and longitude are required."},
            status=400
        )

    report = HazardReport.objects.create(
        user=user,
        hazard_type=hazard_type,
        description=description,
        latitude=latitude,
        longitude=longitude,
    )

    return JsonResponse({
        "message": "Hazard report submitted successfully.",
        "report": {
            "id": report.id,
            "hazard_type": report.hazard_type,
            "description": report.description,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "created_at": report.created_at,
        }
    }, status=201)


def shipment_status(request, shipment_id):
    if request.method != "GET":
        return JsonResponse(
            {"detail": "GET method required."},
            status=405
        )

    try:
        shipment = Shipment.objects.get(shipment_id=str(shipment_id))
    except Shipment.DoesNotExist:
        return JsonResponse(
            {"detail": "Shipment not found."},
            status=404
        )

    return JsonResponse({
        "shipment_id": shipment.shipment_id,
        "status": shipment.status,
        "eta": shipment.eta,
        "message": "Shipment status retrieved successfully.",
    })

@csrf_exempt
def create_hazard_report(request):
    if request.method != "POST":
        return JsonResponse(
            {"detail": "POST method required."},
            status=405
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400
        )

    hazard_type = data.get("hazard_type")
    description = data.get("description", "")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not hazard_type:
        return JsonResponse(
            {"detail": "hazard_type is required."},
            status=400
        )

    if latitude is None or longitude is None:
        return JsonResponse(
            {"detail": "latitude and longitude are required."},
            status=400
        )

    valid_types = dict(HazardReport.HAZARD_TYPES)

    if hazard_type not in valid_types:
        return JsonResponse(
            {"detail": "Invalid hazard_type."},
            status=400
        )

    report = HazardReport.objects.create(
        hazard_type=hazard_type,
        description=description,
        latitude=latitude,
        longitude=longitude,
    )

    return JsonResponse({
        "message": "Hazard report submitted successfully.",
        "report_id": report.id,
        "hazard_type": report.hazard_type,
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "created_at": report.created_at.isoformat(),
    }, status=201)