"""
Main routing engine for NeuRoute AI.

Responsibilities:
    - Obtain candidate routes from OSRM or Google Maps.
    - Evaluate route/segment risk.
    - Reject unsafe routes.
    - Score allowed routes.
    - Calculate ETA.
    - Return recommended and alternate routes.

The engine does not contain ML implementation details.
It consumes the risk_router interface.
"""

from typing import Any, Dict, List, Optional, Tuple

from .eta import ETACalculator
from .risk_router import RiskRouter
from .route_scorer import RouteScorer


Coordinate = Tuple[float, float]


class RouteEngine:
    """
    Main orchestration layer for risk-aware routing.
    """

    def __init__(
        self,
        osrm_client: Any = None,
        google_maps_client: Any = None,
        risk_router: Optional[RiskRouter] = None,
        route_scorer: Optional[RouteScorer] = None,
        eta_calculator: Optional[ETACalculator] = None,
        preferred_provider: str = "osrm",
    ) -> None:

        self.osrm_client = osrm_client
        self.google_maps_client = google_maps_client

        self.risk_router = (
            risk_router
            if risk_router is not None
            else RiskRouter()
        )

        self.route_scorer = (
            route_scorer
            if route_scorer is not None
            else RouteScorer()
        )

        self.eta_calculator = (
            eta_calculator
            if eta_calculator is not None
            else ETACalculator()
        )

        self.preferred_provider = preferred_provider.lower()

        self._validate_provider()

    # ------------------------------------------------------------------
    # MAIN ROUTING METHOD
    # ------------------------------------------------------------------

    def find_routes(
        self,
        source: Coordinate,
        destination: Coordinate,
        risk_inputs: Optional[Dict[int, Dict[str, float]]] = None,
        alternatives: bool = True,
        provider: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Complete risk-aware routing workflow.

        Flow:

            Provider
                ↓
            Candidate routes
                ↓
            Risk evaluation
                ↓
            Unsafe route rejection
                ↓
            Route scoring
                ↓
            ETA calculation
                ↓
            Recommended + alternate route
        """

        selected_provider = (
            provider.lower()
            if provider
            else self.preferred_provider
        )

        routes = self._get_candidate_routes(
            source=source,
            destination=destination,
            alternatives=alternatives,
            provider=selected_provider,
        )

        if not routes:
            return self._no_routes_response(
                provider=selected_provider
            )

        # --------------------------------------------------------------
        # STEP 1 — Risk evaluation
        # --------------------------------------------------------------

        evaluated_routes = self.risk_router.evaluate_routes(
            routes,
            risk_inputs=risk_inputs,
        )

        # --------------------------------------------------------------
        # STEP 2 — Keep only safe/allowed routes
        # --------------------------------------------------------------

        allowed_routes = self.risk_router.get_allowed_routes(
            evaluated_routes
        )

        blocked_routes = self.risk_router.get_blocked_routes(
            evaluated_routes
        )

        # --------------------------------------------------------------
        # STEP 3 — No safe route
        # --------------------------------------------------------------

        if not allowed_routes:

            safety_decision = (
                self.risk_router.make_safety_decision(
                    evaluated_routes
                )
            )

            return {
                "success": True,
                "provider": selected_provider,
                "decision": "DO_NOT_PROCEED",
                "allowed": False,
                "recommended_route": None,
                "alternate_route": None,
                "blocked_routes": blocked_routes,
                "routes": evaluated_routes,
                "reason": safety_decision.get(
                    "reason",
                    "No safe route available.",
                ),
            }

        # --------------------------------------------------------------
        # STEP 4 — Score allowed routes
        # --------------------------------------------------------------

        scored_routes = self.route_scorer.score_routes(
            allowed_routes
        )

        # --------------------------------------------------------------
        # STEP 5 — Add ETA
        # --------------------------------------------------------------

        final_routes = []

        for route in scored_routes:

            route_with_eta = (
                self.eta_calculator.add_eta_to_route(
                    route
                )
            )

            final_routes.append(
                route_with_eta
            )

        # --------------------------------------------------------------
        # STEP 6 — Select recommended + alternate
        # --------------------------------------------------------------

        recommended_route = final_routes[0]

        alternate_route = (
            final_routes[1]
            if len(final_routes) > 1
            else None
        )

        decision = self._get_overall_decision(
            recommended_route
        )

        return {
            "success": True,
            "provider": selected_provider,
            "decision": decision,
            "allowed": True,
            "recommended_route": recommended_route,
            "alternate_route": alternate_route,
            "routes": final_routes,
            "blocked_routes": blocked_routes,
            "total_candidates": len(evaluated_routes),
            "allowed_count": len(allowed_routes),
            "blocked_count": len(blocked_routes),
        }

    # ------------------------------------------------------------------
    # PROVIDER ROUTING
    # ------------------------------------------------------------------

    def _get_candidate_routes(
        self,
        source: Coordinate,
        destination: Coordinate,
        alternatives: bool,
        provider: str,
    ) -> List[Dict[str, Any]]:
        """
        Obtain candidate routes from the selected provider.

        If Google Maps is unavailable and OSRM exists, the engine
        can fall back to OSRM.
        """

        if provider == "google":

            if self.google_maps_client is None:
                raise RuntimeError(
                    "Google Maps client is not configured."
                )

            try:
                return self.google_maps_client.get_routes(
                    source=source,
                    destination=destination,
                    alternatives=alternatives,
                )

            except Exception as exc:

                if self.osrm_client is None:
                    raise RuntimeError(
                        f"Google Maps routing failed: {exc}"
                    ) from exc

                # Google Maps → OSRM fallback
                return self.osrm_client.get_routes(
                    source=source,
                    destination=destination,
                    alternatives=alternatives,
                )

        if provider == "osrm":

            if self.osrm_client is None:
                raise RuntimeError(
                    "OSRM client is not configured."
                )

            try:
                return self.osrm_client.get_routes(
                    source=source,
                    destination=destination,
                    alternatives=alternatives,
                )

            except Exception as exc:

                # Optional reverse fallback.
                if self.google_maps_client is None:
                    raise RuntimeError(
                        f"OSRM routing failed: {exc}"
                    ) from exc

                return self.google_maps_client.get_routes(
                    source=source,
                    destination=destination,
                    alternatives=alternatives,
                )

        raise ValueError(
            f"Unsupported routing provider: {provider}"
        )

    # ------------------------------------------------------------------
    # DECISION
    # ------------------------------------------------------------------

    @staticmethod
    def _get_overall_decision(
        route: Dict[str, Any],
    ) -> str:
        """
        Determine the user-facing routing decision.
        """

        safety_status = route.get(
            "safety_status"
        )

        if safety_status == "CAUTION":
            return "PROCEED_WITH_CAUTION"

        if safety_status == "SAFE":
            return "PROCEED"

        return "DO_NOT_PROCEED"

    # ------------------------------------------------------------------
    # EMPTY RESPONSE
    # ------------------------------------------------------------------

    @staticmethod
    def _no_routes_response(
        provider: str,
    ) -> Dict[str, Any]:

        return {
            "success": False,
            "provider": provider,
            "decision": "DO_NOT_PROCEED",
            "allowed": False,
            "recommended_route": None,
            "alternate_route": None,
            "routes": [],
            "blocked_routes": [],
            "reason": "No candidate routes were returned.",
        }

    # ------------------------------------------------------------------
    # VALIDATION
    # ------------------------------------------------------------------

    def _validate_provider(self) -> None:

        valid_providers = {
            "osrm",
            "google",
        }

        if self.preferred_provider not in valid_providers:
            raise ValueError(
                "preferred_provider must be "
                "'osrm' or 'google'."
            )