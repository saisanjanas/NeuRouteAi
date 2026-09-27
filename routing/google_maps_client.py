"""
Google Maps routing client for NeuRoute AI.

Purpose:
    - Request routes from Google Maps Routes API.
    - Support alternative routes.
    - Normalize Google route data into the same internal
      format used by the OSRM client.

This module does NOT:
    - calculate ML risk
    - decide whether a driver should proceed
    - score routes

Those responsibilities belong to the routing engine.
"""

import os
from typing import Any, Dict, List, Optional, Tuple

import requests


Coordinate = Tuple[float, float]


class GoogleMapsClient:
    """
    Client for Google Maps Routes API.

    Coordinates used internally:
        (latitude, longitude)
    """

    DEFAULT_URL = (
        "https://routes.googleapis.com/directions/v2:computeRoutes"
    )

    def __init__(
        self,
        api_key: Optional[str] = None,
        endpoint: str = DEFAULT_URL,
        timeout: int = 15,
    ) -> None:

        self.api_key = api_key or os.getenv(
            "GOOGLE_MAPS_API_KEY"
        )

        self.endpoint = endpoint
        self.timeout = timeout

        if not self.api_key:
            raise ValueError(
                "Google Maps API key is not configured. "
                "Set GOOGLE_MAPS_API_KEY in the environment."
            )

    # ==========================================================
    # PUBLIC API
    # ==========================================================

    def get_routes(
        self,
        source: Coordinate,
        destination: Coordinate,
        alternatives: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve candidate routes from Google Maps.

        Parameters
        ----------
        source:
            (latitude, longitude)

        destination:
            (latitude, longitude)

        alternatives:
            Request alternative routes.

        Returns
        -------
        List[Dict]
            Normalized routes.
        """

        self._validate_coordinate(source, "source")
        self._validate_coordinate(destination, "destination")

        source_lat, source_lon = source
        destination_lat, destination_lon = destination

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": (
                "routes.distanceMeters,"
                "routes.duration,"
                "routes.polyline,"
                "routes.legs"
            ),
        }

        body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": source_lat,
                        "longitude": source_lon,
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": destination_lat,
                        "longitude": destination_lon,
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "computeAlternativeRoutes": alternatives,
            "languageCode": "en-IN",
            "units": "METRIC",
        }

        response = self._request(
            headers=headers,
            body=body,
        )

        return self._normalize_routes(
            response.get("routes", [])
        )

    # ==========================================================
    # HTTP REQUEST
    # ==========================================================

    def _request(
        self,
        headers: Dict[str, str],
        body: Dict[str, Any],
    ) -> Dict[str, Any]:

        try:
            response = requests.post(
                self.endpoint,
                headers=headers,
                json=body,
                timeout=self.timeout,
            )

            response.raise_for_status()

        except requests.Timeout as exc:
            raise RuntimeError(
                "Google Maps routing request timed out."
            ) from exc

        except requests.RequestException as exc:
            raise RuntimeError(
                f"Google Maps routing request failed: {exc}"
            ) from exc

        try:
            return response.json()

        except ValueError as exc:
            raise RuntimeError(
                "Google Maps returned an invalid JSON response."
            ) from exc

    # ==========================================================
    # ROUTE NORMALIZATION
    # ==========================================================

    def _normalize_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:

        normalized_routes = []

        for index, route in enumerate(
            routes,
            start=1,
        ):

            distance_m = float(
                route.get(
                    "distanceMeters",
                    0,
                )
            )

            duration_seconds = self._parse_duration(
                route.get(
                    "duration",
                    "0s",
                )
            )

            normalized_routes.append(
                {
                    "route_id": f"GOOGLE-{index}",

                    "distance_km": (
                        distance_m / 1000.0
                    ),

                    "duration_minutes": (
                        duration_seconds / 60.0
                    ),

                    "geometry": (
                        route.get("polyline", {})
                        .get("encodedPolyline")
                    ),

                    "legs": route.get(
                        "legs",
                        []
                    ),

                    # Filled by risk_router.py later.
                    "segments": [],

                    "risk_score": None,

                    "maximum_segment_risk": None,

                    "safety_status": (
                        "NOT_EVALUATED"
                    ),

                    "allowed": None,

                    "route_score": None,
                }
            )

        return normalized_routes

    # ==========================================================
    # DURATION
    # ==========================================================

    @staticmethod
    def _parse_duration(
        duration: str,
    ) -> float:
        """
        Convert Google duration strings such as:

            3600s
            185.5s

        into seconds.
        """

        if not duration:
            return 0.0

        if duration.endswith("s"):
            duration = duration[:-1]

        try:
            return float(duration)

        except ValueError:
            return 0.0

    # ==========================================================
    # VALIDATION
    # ==========================================================

    @staticmethod
    def _validate_coordinate(
        coordinate: Coordinate,
        name: str,
    ) -> None:

        if not isinstance(
            coordinate,
            (tuple, list),
        ):
            raise ValueError(
                f"{name} must be "
                "(latitude, longitude)."
            )

        if len(coordinate) != 2:
            raise ValueError(
                f"{name} must contain "
                "latitude and longitude."
            )

        latitude, longitude = coordinate

        if not -90 <= latitude <= 90:
            raise ValueError(
                f"{name} latitude must be "
                "between -90 and 90."
            )

        if not -180 <= longitude <= 180:
            raise ValueError(
                f"{name} longitude must be "
                "between -180 and 180."
            )