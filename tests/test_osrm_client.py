import pytest

from routing.osrm_client import OSRMClient


def test_coordinate_validation():
    client = OSRMClient()

    client._validate_coordinate(
        (12.9716, 77.5946),
        "source",
    )


def test_invalid_coordinate_latitude():
    client = OSRMClient()

    with pytest.raises(ValueError):
        client._validate_coordinate(
            (100.0, 77.5946),
            "source",
        )


def test_invalid_coordinate_length():
    client = OSRMClient()

    with pytest.raises(ValueError):
        client._validate_coordinate(
            (12.9716,),
            "source",
        )


def test_extract_location():
    client = OSRMClient()

    location = client._extract_location(
        [77.5946, 12.9716]
    )

    assert location == {
        "latitude": 12.9716,
        "longitude": 77.5946,
    }


def test_normalize_routes():
    client = OSRMClient()

    raw_routes = [
        {
            "distance": 10000,
            "duration": 1200,
            "geometry": {
                "type": "LineString",
                "coordinates": [],
            },
            "legs": [],
        }
    ]

    routes = client._normalize_routes(raw_routes)

    assert len(routes) == 1
    assert routes[0]["route_id"] == "OSRM-1"
    assert routes[0]["distance_km"] == 10.0
    assert routes[0]["duration_minutes"] == 20.0
    assert routes[0]["risk_score"] is None
    assert routes[0]["allowed"] is None