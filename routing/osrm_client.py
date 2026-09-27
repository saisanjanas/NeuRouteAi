"""
OSRM routing client for the NeuRoute AI project.

Purpose:
    - Retrieve candidate driving routes from OSRM.
    - Support alternative routes.
    - Preserve route geometry and road segments.
    - Normalize OSRM data for the NeuRoute routing engine.

The client does NOT decide whether a route is safe.
Safety decisions are handled later by risk_router.py.
"""

from typing import Any, Dict, List, Optional, Tuple

import requests


Coordinate = Tuple[float, float]


class OSRMClient:
    """
    Client for OSRM's public routing API.

    Coordinates used by this class:
        (latitude, longitude)

    OSRM internally expects:
        longitude,latitude
    """

    DEFAULT_BASE_URL = "https://router.project-osrm.org"

    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        timeout: int = 15,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ==========================================================
    # PUBLIC API
    # ==========================================================

    def get_routes(
        self,
        source: Coordinate,
        destination: Coordinate,
        alternatives: bool = True,
        overview: str = "full",
        steps: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve candidate routes between source and destination.

        Parameters
        ----------
        source:
            (latitude, longitude)

        destination:
            (latitude, longitude)

        alternatives:
            Request alternative routes from OSRM.

        overview:
            Route geometry detail.
            "full" is recommended for risk analysis.

        steps:
            Request road-level navigation steps.

        Returns
        -------
        List[Dict]
            Normalized candidate routes.

        Example
        -------
        [
            {
                "route_id": "OSRM-1",
                "distance_km": 123.4,
                "duration_minutes": 210.5,
                "geometry": {...},
                "segments": [...]
            }
        ]
        """

        self._validate_coordinate(source, "source")
        self._validate_coordinate(destination, "destination")

        source_lat, source_lon = source
        destination_lat, destination_lon = destination

        # OSRM requires:
        # longitude,latitude
        coordinates = (
            f"{source_lon},{source_lat};"
            f"{destination_lon},{destination_lat}"
        )

        url = f"{self.base_url}/route/v1/driving/{coordinates}"

        params = {
            "alternatives": "true" if alternatives else "false",
            "overview": overview,
            "steps": "true" if steps else "false",
            "geometries": "geojson",
        }

        data = self._request(url, params)

        if data.get("code") != "Ok":
            raise RuntimeError(
                f"OSRM routing failed: "
                f"{data.get('message', 'Unknown OSRM error')}"
            )

        routes = data.get("routes", [])

        if not routes:
            raise RuntimeError(
                "OSRM returned no candidate routes."
            )

        return self._normalize_routes(routes)

    # ==========================================================
    # OSRM REQUEST
    # ==========================================================

    def _request(
        self,
        url: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Perform the HTTP request to OSRM.
        """

        try:
            response = requests.get(
                url,
                params=params,
                timeout=self.timeout,
            )

            response.raise_for_status()

        except requests.Timeout as exc:
            raise RuntimeError(
                "OSRM request timed out."
            ) from exc

        except requests.RequestException as exc:
            raise RuntimeError(
                f"Unable to connect to OSRM: {exc}"
            ) from exc

        try:
            return response.json()

        except ValueError as exc:
            raise RuntimeError(
                "OSRM returned an invalid JSON response."
            ) from exc

    # ==========================================================
    # ROUTE NORMALIZATION
    # ==========================================================

    def _normalize_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Convert raw OSRM routes into the internal
        NeuRoute AI route format.
        """

        normalized_routes: List[Dict[str, Any]] = []

        for index, route in enumerate(routes, start=1):

            distance_m = float(
                route.get("distance", 0.0)
            )

            duration_seconds = float(
                route.get("duration", 0.0)
            )

            normalized_route = {
                "route_id": f"OSRM-{index}",

                # Basic route metrics
                "distance_km": distance_m / 1000.0,
                "duration_minutes": duration_seconds / 60.0,

                # Route geometry
                "geometry": route.get("geometry"),

                # OSRM route legs
                "legs": route.get("legs", []),

                # Segment information extracted below
                "segments": self._extract_segments(
                    route.get("legs", [])
                ),

                # Will be populated later by risk_router.py
                "risk_score": None,
                "maximum_segment_risk": None,

                # Will be populated later by risk_router.py
                "safety_status": "NOT_EVALUATED",
                "allowed": None,

                # Will be populated later by route_engine.py
                "route_score": None,
            }

            normalized_routes.append(normalized_route)

        return normalized_routes

    # ==========================================================
    # SEGMENT EXTRACTION
    # ==========================================================

    def _extract_segments(
        self,
        legs: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Extract individual road segments/steps from OSRM legs.

        These segments are intentionally kept separate because
        the risk engine must be able to evaluate individual
        segments rather than relying only on an average route risk.
        """

        segments: List[Dict[str, Any]] = []

        segment_counter = 1

        for leg_index, leg in enumerate(legs, start=1):

            steps = leg.get("steps", [])

            for step_index, step in enumerate(steps, start=1):

                distance_m = float(
                    step.get("distance", 0.0)
                )

                duration_seconds = float(
                    step.get("duration", 0.0)
                )

                maneuver = step.get(
                    "maneuver",
                    {},
                )

                segment = {
                    "segment_id": segment_counter,

                    "leg_index": leg_index,
                    "step_index": step_index,

                    "distance_km": distance_m / 1000.0,

                    "duration_minutes": (
                        duration_seconds / 60.0
                    ),

                    "road_name": step.get(
                        "name",
                        "",
                    ),

                    "road_ref": step.get(
                        "ref",
                        "",
                    ),

                    "road_type": step.get(
                        "highway",
                        "",
                    ),

                    "geometry": step.get(
                        "geometry"
                    ),

                    "start_location": self._extract_location(
                        maneuver.get("location")
                    ),

                    # Risk fields are deliberately empty here.
                    # The ML/risk module will populate them later.
                    "risk_score": None,

                    "risk_status": "NOT_EVALUATED",

                    "blocked": False,
                }

                segments.append(segment)

                segment_counter += 1

        return segments

    # ==========================================================
    # COORDINATE VALIDATION
    # ==========================================================

    @staticmethod
    def _validate_coordinate(
        coordinate: Coordinate,
        name: str,
    ) -> None:
        """
        Validate latitude/longitude input.
        """

        if not isinstance(coordinate, (tuple, list)):
            raise ValueError(
                f"{name} must be a "
                "(latitude, longitude) tuple."
            )

        if len(coordinate) != 2:
            raise ValueError(
                f"{name} must contain latitude "
                "and longitude."
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

    # ==========================================================
    # LOCATION EXTRACTION
    # ==========================================================

    @staticmethod
    def _extract_location(
        location: Optional[List[float]],
    ) -> Optional[Dict[str, float]]:
        """
        Convert OSRM's [longitude, latitude] location
        into our internal latitude/longitude representation.
        """

        if not location or len(location) < 2:
            return None

        longitude, latitude = location[:2]

        return {
            "latitude": latitude,
            "longitude": longitude,
        }