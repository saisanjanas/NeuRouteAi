"""
Route scoring module for NeuRoute AI.

Responsibilities:
    - Normalize distance, time, and risk values.
    - Calculate a route score.
    - Prefer shorter/faster/safer routes.
    - Keep scoring separate from the final safety decision.

Safety decisions such as:
    - DO NOT PROCEED
    - AVOID
    - CAUTION
    - SAFE

are handled by risk_router.py.

The weights and thresholds are configurable engineering values.
They are not validated real-world safety limits.
"""

from typing import Any, Dict, List


class RouteScorer:
    """
    Calculates comparable scores for candidate routes.

    Lower route_score = better route.

    Default weighting:
        Distance: 35%
        Time:     25%
        Risk:     40%

    Risk receives the highest weight because the project is
    safety-oriented. However, risk-based blocking is handled
    separately by risk_router.py.
    """

    def __init__(
        self,
        distance_weight: float = 0.35,
        time_weight: float = 0.25,
        risk_weight: float = 0.40,
    ) -> None:

        self._validate_weights(
            distance_weight,
            time_weight,
            risk_weight,
        )

        self.distance_weight = distance_weight
        self.time_weight = time_weight
        self.risk_weight = risk_weight

    def score_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Calculate scores for all candidate routes.

        Routes marked as unsafe/blocked are not selected as
        recommended routes. They may still be returned with
        their calculated score for transparency/debugging.
        """

        if not routes:
            return []

        self._validate_routes(routes)

        max_distance = max(
            float(route.get("distance_km", 0.0))
            for route in routes
        )

        max_time = max(
            float(route.get("duration_minutes", 0.0))
            for route in routes
        )

        scored_routes = []

        for route in routes:
            distance = float(route.get("distance_km", 0.0))
            duration = float(route.get("duration_minutes", 0.0))

            risk = self._get_route_risk(route)

            normalized_distance = self._normalize(
                distance,
                max_distance,
            )

            normalized_time = self._normalize(
                duration,
                max_time,
            )

            route_score = (
                normalized_distance * self.distance_weight
                + normalized_time * self.time_weight
                + risk * self.risk_weight
            )

            scored_route = dict(route)

            scored_route["normalized_distance"] = round(
                normalized_distance,
                4,
            )

            scored_route["normalized_time"] = round(
                normalized_time,
                4,
            )

            scored_route["normalized_risk"] = round(
                risk,
                4,
            )

            scored_route["route_score"] = round(
                route_score,
                4,
            )

            scored_routes.append(scored_route)

        return sorted(
            scored_routes,
            key=lambda route: route["route_score"],
        )

    def select_best_allowed_route(
        self,
        routes: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Select the lowest-scoring route that is explicitly allowed.

        This method never treats an unevaluated route as safe.
        """

        if not routes:
            raise ValueError("No routes available.")

        allowed_routes = [
            route
            for route in routes
            if route.get("allowed") is True
        ]

        if not allowed_routes:
            raise RuntimeError(
                "No allowed route is available."
            )

        scored_routes = self.score_routes(allowed_routes)

        return scored_routes[0]

    def rank_allowed_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Return only explicitly allowed routes, ordered by score.
        """

        allowed_routes = [
            route
            for route in routes
            if route.get("allowed") is True
        ]

        if not allowed_routes:
            return []

        return self.score_routes(allowed_routes)

    @staticmethod
    def _get_route_risk(route: Dict[str, Any]) -> float:
        """
        Determine the route-level risk used for scoring.

        Maximum segment risk is preferred because a single
        dangerous segment should not be hidden by a low average.

        Falls back to route-level risk_score when segment risk
        is unavailable.
        """

        maximum_segment_risk = route.get(
            "maximum_segment_risk"
        )

        if maximum_segment_risk is not None:
            return RouteScorer._clamp_risk(
                maximum_segment_risk
            )

        risk_score = route.get("risk_score")

        if risk_score is not None:
            return RouteScorer._clamp_risk(
                risk_score
            )

        # Unevaluated risk must not silently become zero risk.
        raise ValueError(
            f"Route {route.get('route_id', 'UNKNOWN')} "
            "does not contain a risk score."
        )

    @staticmethod
    def _normalize(
        value: float,
        maximum: float,
    ) -> float:
        """
        Normalize a value into the range [0, 1].

        0 = best
        1 = worst relative to the candidate routes.
        """

        if value < 0:
            raise ValueError(
                "Distance/time values cannot be negative."
            )

        if maximum <= 0:
            return 0.0

        return min(value / maximum, 1.0)

    @staticmethod
    def _clamp_risk(value: Any) -> float:
        """
        Ensure risk remains in the expected [0, 1] range.
        """

        try:
            risk = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Invalid risk score: {value}"
            ) from exc

        if not 0.0 <= risk <= 1.0:
            raise ValueError(
                f"Risk score must be between 0 and 1. "
                f"Received: {risk}"
            )

        return risk

    @staticmethod
    def _validate_weights(
        distance_weight: float,
        time_weight: float,
        risk_weight: float,
    ) -> None:

        weights = [
            distance_weight,
            time_weight,
            risk_weight,
        ]

        if any(weight < 0 for weight in weights):
            raise ValueError(
                "Route scoring weights cannot be negative."
            )

        total = sum(weights)

        if abs(total - 1.0) > 1e-6:
            raise ValueError(
                "Route scoring weights must sum to 1.0."
            )

    @staticmethod
    def _validate_routes(
        routes: List[Dict[str, Any]],
    ) -> None:

        for route in routes:
            if "distance_km" not in route:
                raise ValueError(
                    "Route is missing distance_km."
                )

            if "duration_minutes" not in route:
                raise ValueError(
                    "Route is missing duration_minutes."
                )