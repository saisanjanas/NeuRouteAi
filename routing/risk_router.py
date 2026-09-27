# routing/risk_router.py

from typing import Any, Callable, Dict, List, Optional


class RiskRouter:
    """
    Safety decision layer for risk-aware routing.

    Default risk classification:

        < 0.40       SAFE
        < 0.70       CAUTION
        < 0.85       HIGH_RISK / AVOID
        >= 0.85      DO_NOT_PROCEED / BLOCK
    """

    SAFE_THRESHOLD = 0.40
    CAUTION_THRESHOLD = 0.70
    BLOCK_THRESHOLD = 0.85

    def __init__(
        self,
        risk_predictor: Optional[Callable[..., float]] = None,
        safe_threshold: float = SAFE_THRESHOLD,
        caution_threshold: float = CAUTION_THRESHOLD,
        block_threshold: float = BLOCK_THRESHOLD,
    ) -> None:
        self.risk_predictor = risk_predictor
        self.safe_threshold = safe_threshold
        self.caution_threshold = caution_threshold
        self.block_threshold = block_threshold
        self._validate_thresholds()

    def evaluate_routes(
        self,
        routes: List[Dict[str, Any]],
        risk_inputs: Optional[Dict[int, Dict[str, float]]] = None,
    ) -> List[Dict[str, Any]]:
        if not routes:
            return []

        return [
            self.evaluate_route(route, risk_inputs=risk_inputs)
            for route in routes
        ]

    def evaluate_route(
        self,
        route: Dict[str, Any],
        risk_inputs: Optional[Dict[int, Dict[str, float]]] = None,
    ) -> Dict[str, Any]:

        evaluated_route = dict(route)
        segments = route.get("segments", [])

        if not segments:
            return self._evaluate_route_without_segments(
                evaluated_route
            )

        evaluated_segments = []
        risk_values = []
        blocked_segments = []

        for segment in segments:
            evaluated_segment = self.evaluate_segment(
                segment,
                risk_inputs=risk_inputs,
            )

            evaluated_segments.append(evaluated_segment)

            risk = evaluated_segment["risk_score"]

            if risk is not None:
                risk_values.append(risk)

            if evaluated_segment["blocked"]:
                blocked_segments.append(
                    evaluated_segment["segment_id"]
                )

        evaluated_route["segments"] = evaluated_segments

        if risk_values:
            evaluated_route["risk_score"] = round(
                sum(risk_values) / len(risk_values),
                4,
            )
            evaluated_route["maximum_segment_risk"] = round(
                max(risk_values),
                4,
            )
        else:
            evaluated_route["risk_score"] = None
            evaluated_route["maximum_segment_risk"] = None

        evaluated_route["blocked_segments"] = blocked_segments

        if blocked_segments:
            evaluated_route["allowed"] = False

            has_unevaluated_segment = any(
                segment.get("risk_status") == "NOT_EVALUATED"
                for segment in evaluated_segments
                if segment.get("segment_id") in blocked_segments
            )

            if has_unevaluated_segment:
                evaluated_route["safety_status"] = "NOT_EVALUATED"
            else:
                evaluated_route["safety_status"] = "DO_NOT_PROCEED"

        elif evaluated_route["maximum_segment_risk"] is None:
            evaluated_route["allowed"] = False
            evaluated_route["safety_status"] = "NOT_EVALUATED"

        elif evaluated_route["maximum_segment_risk"] >= self.block_threshold:
            evaluated_route["allowed"] = False
            evaluated_route["safety_status"] = "DO_NOT_PROCEED"

        elif evaluated_route["maximum_segment_risk"] >= self.caution_threshold:
            evaluated_route["allowed"] = False
            evaluated_route["safety_status"] = "HIGH_RISK"

        elif evaluated_route["maximum_segment_risk"] >= self.safe_threshold:
            evaluated_route["allowed"] = True
            evaluated_route["safety_status"] = "CAUTION"

        else:
            evaluated_route["allowed"] = True
            evaluated_route["safety_status"] = "SAFE"

        return evaluated_route

    def evaluate_segment(
        self,
        segment: Dict[str, Any],
        risk_inputs: Optional[Dict[int, Dict[str, float]]] = None,
    ) -> Dict[str, Any]:

        evaluated_segment = dict(segment)
        segment_id = segment.get("segment_id")

        if segment.get("blocked") is True:
            evaluated_segment["risk_status"] = "DO_NOT_PROCEED"
            evaluated_segment["risk_score"] = 1.0
            evaluated_segment["blocked"] = True
            return evaluated_segment

        risk_score = segment.get("risk_score")

        if risk_score is None:
            if self.risk_predictor is None:
                evaluated_segment["risk_score"] = None
                evaluated_segment["risk_status"] = "NOT_EVALUATED"
                evaluated_segment["blocked"] = True
                return evaluated_segment

            if risk_inputs is None:
                raise ValueError(
                    "risk_inputs are required when risk scores "
                    "must be predicted."
                )

            environmental_data = risk_inputs.get(segment_id)

            if environmental_data is None:
                raise ValueError(
                    f"No environmental data found for segment {segment_id}."
                )

            risk_score = self._predict_risk(
                segment_id=segment_id,
                environmental_data=environmental_data,
            )

        risk_score = self._validate_risk_score(risk_score)

        evaluated_segment["risk_score"] = round(
            risk_score,
            4,
        )

        status = self.classify_risk(risk_score)

        evaluated_segment["risk_status"] = status
        evaluated_segment["blocked"] = (
            risk_score >= self.block_threshold
        )

        return evaluated_segment

    def classify_risk(self, risk_score: float) -> str:
        risk_score = self._validate_risk_score(risk_score)

        if risk_score >= self.block_threshold:
            return "DO_NOT_PROCEED"

        if risk_score >= self.caution_threshold:
            return "HIGH_RISK"

        if risk_score >= self.safe_threshold:
            return "CAUTION"

        return "SAFE"

    def get_allowed_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        return [
            route
            for route in routes
            if route.get("allowed") is True
        ]

    def get_blocked_routes(
        self,
        routes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        return [
            route
            for route in routes
            if route.get("allowed") is False
        ]

    def make_safety_decision(
        self,
        routes: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        if not routes:
            return {
                "decision": "DO_NOT_PROCEED",
                "allowed": False,
                "recommended_route": None,
                "alternate_route": None,
                "reason": "No candidate routes available.",
            }

        allowed_routes = self.get_allowed_routes(routes)
        blocked_routes = self.get_blocked_routes(routes)

        if not allowed_routes:
            return {
                "decision": "DO_NOT_PROCEED",
                "allowed": False,
                "recommended_route": None,
                "alternate_route": None,
                "blocked_routes": blocked_routes,
                "reason": (
                    "All candidate routes contain unsafe "
                    "or unevaluated segments."
                ),
            }

        ranked_routes = sorted(
            allowed_routes,
            key=self._route_sort_key,
        )

        recommended_route = ranked_routes[0]

        alternate_route = (
            ranked_routes[1]
            if len(ranked_routes) > 1
            else None
        )

        if recommended_route["safety_status"] == "CAUTION":
            decision = "PROCEED_WITH_CAUTION"
        else:
            decision = "PROCEED"

        return {
            "decision": decision,
            "allowed": True,
            "recommended_route": recommended_route,
            "alternate_route": alternate_route,
            "blocked_routes": blocked_routes,
            "reason": (
                "At least one candidate route passed "
                "the configured safety thresholds."
            ),
        }

    def _predict_risk(
        self,
        segment_id: int,
        environmental_data: Dict[str, float],
    ) -> float:

        rainfall = environmental_data.get("rainfall")
        slope = environmental_data.get("slope")
        elevation = environmental_data.get("elevation")

        if rainfall is None:
            raise ValueError(
                f"Missing rainfall for segment {segment_id}."
            )

        if slope is None:
            raise ValueError(
                f"Missing slope for segment {segment_id}."
            )

        if elevation is None:
            raise ValueError(
                f"Missing elevation for segment {segment_id}."
            )

        risk = self.risk_predictor(
            segment_id=segment_id,
            rainfall=float(rainfall),
            slope=float(slope),
            elevation=float(elevation),
        )

        return self._validate_risk_score(risk)

    def _evaluate_route_without_segments(
        self,
        route: Dict[str, Any],
    ) -> Dict[str, Any]:

        route["blocked_segments"] = []

        route_risk = route.get("risk_score")

        if route_risk is None:
            route["maximum_segment_risk"] = None
            route["allowed"] = False
            route["safety_status"] = "NOT_EVALUATED"
            return route

        route_risk = self._validate_risk_score(route_risk)

        route["risk_score"] = round(
            route_risk,
            4,
        )

        route["maximum_segment_risk"] = round(
            route_risk,
            4,
        )

        route["safety_status"] = self.classify_risk(
            route_risk
        )

        route["allowed"] = (
            route_risk < self.caution_threshold
        )

        if route_risk >= self.block_threshold:
            route["allowed"] = False

        return route

    def _validate_thresholds(self) -> None:
        if not (
            0.0
            <= self.safe_threshold
            < self.caution_threshold
            < self.block_threshold
            <= 1.0
        ):
            raise ValueError(
                "Risk thresholds must satisfy: "
                "0 <= safe < caution < block <= 1."
            )

    @staticmethod
    def _validate_risk_score(
        risk_score: Any,
    ) -> float:

        try:
            risk = float(risk_score)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Invalid risk score: {risk_score}"
            ) from exc

        if not 0.0 <= risk <= 1.0:
            raise ValueError(
                f"Risk score must be between 0 and 1. "
                f"Received: {risk}"
            )

        return risk

    @staticmethod
    def _route_sort_key(
        route: Dict[str, Any],
    ) -> tuple:

        route_score = route.get("route_score")

        if route_score is not None:
            return (
                float(route_score),
                float(
                    route.get(
                        "maximum_segment_risk",
                        1.0,
                    )
                ),
            )

        return (
            float(
                route.get(
                    "maximum_segment_risk",
                    1.0,
                )
            ),
            float(
                route.get(
                    "duration_minutes",
                    float("inf"),
                )
            ),
        )