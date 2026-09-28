from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.authtoken.models import Token
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

    return JsonResponse({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
        }
    })
def shipment_status(request, shipment_id):
    if request.method != "GET":
        return JsonResponse(
            {"detail": "GET method required."},
            status=405
        )

    return JsonResponse({
        "shipment_id": shipment_id,
        "status": "In Transit",
        "message": "Shipment status retrieved successfully."
    })