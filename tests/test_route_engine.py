from routing.eta import ETACalculator
from routing.risk_router import RiskRouter
from routing.route_engine import RouteEngine
from routing.route_scorer import RouteScorer


class FakeOSRMClient:

    def get_routes(
        self,
        source,
        destination,
        alternatives=True,
    ):
        return [
            {
                "route_id": "R1",
                "distance_km": 80.0,
                "duration_minutes": 100.0,
                "geometry": None,
                "legs": [],
                "segments": [
                    {
                        "segment_id": 1,
                        "distance_km": 40.0,
                        "duration_minutes": 50.0,
                        "road_name": "Safe Road",
                        "risk_score": 0.20,
                        "risk_status": "NOT_EVALUATED",
                        "blocked": False,
                    },
                    {
                        "segment_id": 2,
                        "distance_km": 40.0,
                        "duration_minutes": 50.0,
                        "road_name": "Safe Road 2",
                        "risk_score": 0.25,
                        "risk_status": "NOT_EVALUATED",
                        "blocked": False,
                    },
                ],
                "risk_score": None,
                "maximum_segment_risk": None,
                "safety_status": "NOT_EVALUATED",
                "allowed": None,
                "route_score": None,
            },
            {
                "route_id": "R2",
                "distance_km": 60.0,
                "duration_minutes": 80.0,
                "geometry": None,
                "legs": [],
                "segments": [
                    {
                        "segment_id": 3,
                        "distance_km": 30.0,
                        "duration_minutes": 40.0,
                        "road_name": "Risky Road",
                        "risk_score": 0.90,
                        "risk_status": "NOT_EVALUATED",
                        "blocked": False,
                    },
                    {
                        "segment_id": 4,
                        "distance_km": 30.0,
                        "duration_minutes": 40.0,
                        "road_name": "Risky Road 2",
                        "risk_score": 0.20,
                        "risk_status": "NOT_EVALUATED",
                        "blocked": False,
                    },
                ],
                "risk_score": None,
                "maximum_segment_risk": None,
                "safety_status": "NOT_EVALUATED",
                "allowed": None,
                "route_score": None,
            },
        ]


def create_engine():
    return RouteEngine(
        osrm_client=FakeOSRMClient(),
        risk_router=RiskRouter(),
        route_scorer=RouteScorer(),
        eta_calculator=ETACalculator(),
        preferred_provider="osrm",
    )


def test_route_engine_returns_recommended_route():

    engine = create_engine()

    result = engine.find_routes(
        source=(12.9716, 77.5946),
        destination=(13.0827, 80.2707),
    )

    assert result["success"] is True
    assert result["allowed"] is True
    assert result["decision"] == "PROCEED"

    assert result["recommended_route"] is not None

    assert (
        result["recommended_route"]["route_id"]
        == "R1"
    )


def test_unsafe_shorter_route_is_not_selected():

    engine = create_engine()

    result = engine.find_routes(
        source=(12.9716, 77.5946),
        destination=(13.0827, 80.2707),
    )

    recommended = result["recommended_route"]

    assert recommended["route_id"] == "R1"

    assert recommended["maximum_segment_risk"] < 0.85

    blocked_ids = [
        route["route_id"]
        for route in result["blocked_routes"]
    ]

    assert "R2" in blocked_ids


def test_eta_is_added():

    engine = create_engine()

    result = engine.find_routes(
        source=(12.9716, 77.5946),
        destination=(13.0827, 80.2707),
    )

    route = result["recommended_route"]

    assert "eta_minutes" in route
    assert "eta_hours" in route
    assert "eta_text" in route


def test_alternate_route():

    engine = create_engine()

    # Make both routes safe for this test.
    class TwoSafeRoutes(FakeOSRMClient):

        def get_routes(
            self,
            source,
            destination,
            alternatives=True,
        ):
            routes = super().get_routes(
                source,
                destination,
                alternatives,
            )

            routes[1]["segments"][0]["risk_score"] = 0.30

            return routes

    engine.osrm_client = TwoSafeRoutes()

    result = engine.find_routes(
        source=(12.9716, 77.5946),
        destination=(13.0827, 80.2707),
    )

    assert result["recommended_route"] is not None
    assert result["alternate_route"] is not None


def test_all_routes_unsafe_returns_do_not_proceed():

    class UnsafeOSRMClient:

        def get_routes(
            self,
            source,
            destination,
            alternatives=True,
        ):
            return [
                {
                    "route_id": "UNSAFE-1",
                    "distance_km": 50.0,
                    "duration_minutes": 60.0,
                    "segments": [
                        {
                            "segment_id": 1,
                            "risk_score": 0.90,
                            "blocked": False,
                        }
                    ],
                },
                {
                    "route_id": "UNSAFE-2",
                    "distance_km": 70.0,
                    "duration_minutes": 80.0,
                    "segments": [
                        {
                            "segment_id": 2,
                            "risk_score": 0.95,
                            "blocked": False,
                        }
                    ],
                },
            ]

    engine = RouteEngine(
        osrm_client=UnsafeOSRMClient(),
        risk_router=RiskRouter(),
        route_scorer=RouteScorer(),
        eta_calculator=ETACalculator(),
        preferred_provider="osrm",
    )

    result = engine.find_routes(
        source=(12.9716, 77.5946),
        destination=(13.0827, 80.2707),
    )

    assert result["decision"] == "DO_NOT_PROCEED"
    assert result["allowed"] is False
    assert result["recommended_route"] is None
    assert result["alternate_route"] is None