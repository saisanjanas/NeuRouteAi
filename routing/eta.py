"""
ETA calculation module for NeuRoute AI.

Responsibilities:
    - Calculate ETA from route duration.
    - Support traffic/weather/risk adjustments.
    - Provide a consistent ETA representation to the route engine.

This module does not decide route safety.
"""

from typing import Any, Dict, Optional


class ETACalculator:
    """
    Calculates estimated travel time.

    Base ETA comes from the routing provider.

    Optional adjustment factors can account for:
        - traffic
        - weather
        - terrain
        - operational delays

    Adjustment factors are configurable and should be calibrated
    using project data before being treated as production values.
    """

    def __init__(
        self,
        traffic_factor: float = 1.0,
        weather_factor: float = 1.0,
        terrain_factor: float = 1.0,
        operational_factor: float = 1.0,
    ) -> None:

        self.traffic_factor = traffic_factor
        self.weather_factor = weather_factor
        self.terrain_factor = terrain_factor
        self.operational_factor = operational_factor

        self._validate_factors(
            traffic_factor=self.traffic_factor,
            weather_factor=self.weather_factor,
            terrain_factor=self.terrain_factor,
            operational_factor=self.operational_factor,
        )

    def calculate(
        self,
        base_duration_minutes: float,
        traffic_factor: Optional[float] = None,
        weather_factor: Optional[float] = None,
        terrain_factor: Optional[float] = None,
        operational_factor: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculate adjusted ETA.

        Returns:

            {
                "base_eta_minutes": ...,
                "adjusted_eta_minutes": ...,
                "eta_hours": ...,
                "eta_text": ...
            }
        """

        if base_duration_minutes < 0:
            raise ValueError(
                "Base duration cannot be negative."
            )

        traffic = (
            self.traffic_factor
            if traffic_factor is None
            else traffic_factor
        )

        weather = (
            self.weather_factor
            if weather_factor is None
            else weather_factor
        )

        terrain = (
            self.terrain_factor
            if terrain_factor is None
            else terrain_factor
        )

        operational = (
            self.operational_factor
            if operational_factor is None
            else operational_factor
        )

        self._validate_factors(
            traffic,
            weather,
            terrain,
            operational,
        )

        adjusted_eta = (
            float(base_duration_minutes)
            * traffic
            * weather
            * terrain
            * operational
        )

        return {
            "base_eta_minutes": round(
                float(base_duration_minutes),
                2,
            ),
            "adjusted_eta_minutes": round(
                adjusted_eta,
                2,
            ),
            "eta_hours": round(
                adjusted_eta / 60.0,
                2,
            ),
            "eta_text": self._format_eta(
                adjusted_eta
            ),
        }

    def calculate_route_eta(
        self,
        route: Dict[str, Any],
        traffic_factor: Optional[float] = None,
        weather_factor: Optional[float] = None,
        terrain_factor: Optional[float] = None,
        operational_factor: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculate ETA directly from a normalized route object.
        """

        if "duration_minutes" not in route:
            raise ValueError(
                "Route is missing duration_minutes."
            )

        return self.calculate(
            base_duration_minutes=float(
                route["duration_minutes"]
            ),
            traffic_factor=traffic_factor,
            weather_factor=weather_factor,
            terrain_factor=terrain_factor,
            operational_factor=operational_factor,
        )

    def add_eta_to_route(
        self,
        route: Dict[str, Any],
        traffic_factor: Optional[float] = None,
        weather_factor: Optional[float] = None,
        terrain_factor: Optional[float] = None,
        operational_factor: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Add ETA fields directly to a route dictionary.
        """

        updated_route = dict(route)

        eta = self.calculate_route_eta(
            updated_route,
            traffic_factor=traffic_factor,
            weather_factor=weather_factor,
            terrain_factor=terrain_factor,
            operational_factor=operational_factor,
        )

        updated_route["base_eta_minutes"] = (
            eta["base_eta_minutes"]
        )

        updated_route["eta_minutes"] = (
            eta["adjusted_eta_minutes"]
        )

        updated_route["eta_hours"] = (
            eta["eta_hours"]
        )

        updated_route["eta_text"] = (
            eta["eta_text"]
        )

        return updated_route

    @staticmethod
    def _format_eta(
        minutes: float,
    ) -> str:
        """
        Convert minutes into a human-readable ETA.
        """

        total_minutes = max(
            0,
            round(minutes),
        )

        hours = total_minutes // 60
        remaining_minutes = total_minutes % 60

        if hours == 0:
            return f"{remaining_minutes} min"

        if remaining_minutes == 0:
            return f"{hours} hr"

        return (
            f"{hours} hr "
            f"{remaining_minutes} min"
        )

    @staticmethod
    def _validate_factors(
        traffic_factor: float = 1.0,
        weather_factor: float = 1.0,
        terrain_factor: float = 1.0,
        operational_factor: float = 1.0,
    ) -> None:

        factors = {
            "traffic_factor": traffic_factor,
            "weather_factor": weather_factor,
            "terrain_factor": terrain_factor,
            "operational_factor": operational_factor,
        }

        for name, factor in factors.items():

            if factor <= 0:
                raise ValueError(
                    f"{name} must be greater than 0."
                )