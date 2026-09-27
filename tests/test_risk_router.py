import pytest

from routing.risk_router import RiskRouter


def make_segment(
    segment_id,
    risk_score=None,
    blocked=False,
):
    return {
        "segment_id": segment_id,
        "distance_km": 5.0,
        "duration_minutes": 10.0,
        "road_name": f"Road {segment_id}",
        "risk_score": risk_score,
        "risk_status": "NOT_EVALUATED",
        "blocked": blocked,
    }


def make_route(
    route_id,
    segments,
):
    return {
        "route_id": route_id,
        "distance_km": 100.0,
        "duration_minutes": 120.0,
        "segments": segments,
    }


def test_safe_segment():
    router = RiskRouter()

    segment = make_segment(
        segment_id=1,
        risk_score=0.20,
    )

    result = router.evaluate_segment(segment)

    assert result["risk_status"] == "SAFE"
    assert result["blocked"] is False


def test_caution_segment():
    router = RiskRouter()

    segment = make_segment(
        segment_id=1,
        risk_score=0.50,
    )

    result = router.evaluate_segment(segment)

    assert result["risk_status"] == "CAUTION"
    assert result["blocked"] is False


def test_high_risk_segment():
    router = RiskRouter()

    segment = make_segment(
        segment_id=1,
        risk_score=0.75,
    )

    result = router.evaluate_segment(segment)

    assert result["risk_status"] == "HIGH_RISK"
    assert result["blocked"] is False


def test_dangerous_segment_is_blocked():
    router = RiskRouter()

    segment = make_segment(
        segment_id=1,
        risk_score=0.90,
    )

    result = router.evaluate_segment(segment)

    assert result["risk_status"] == "DO_NOT_PROCEED"
    assert result["blocked"] is True


def test_one_dangerous_segment_blocks_entire_route():
    router = RiskRouter()

    route = make_route(
        "R1",
        [
            make_segment(1, 0.10),
            make_segment(2, 0.20),
            make_segment(3, 0.90),
        ],
    )

    result = router.evaluate_route(route)

    assert result["allowed"] is False
    assert result["safety_status"] == "DO_NOT_PROCEED"
    assert result["maximum_segment_risk"] == 0.90
    assert 3 in result["blocked_segments"]


def test_safe_route_is_allowed():
    router = RiskRouter()

    route = make_route(
        "R1",
        [
            make_segment(1, 0.10),
            make_segment(2, 0.20),
            make_segment(3, 0.30),
        ],
    )

    result = router.evaluate_route(route)

    assert result["allowed"] is True
    assert result["safety_status"] == "SAFE"


def test_no_safe_route_returns_do_not_proceed():
    router = RiskRouter()

    routes = [
        make_route(
            "R1",
            [make_segment(1, 0.90)],
        ),
        make_route(
            "R2",
            [make_segment(2, 0.95)],
        ),
    ]

    evaluated = router.evaluate_routes(routes)

    decision = router.make_safety_decision(
        evaluated
    )

    assert decision["decision"] == "DO_NOT_PROCEED"
    assert decision["allowed"] is False
    assert decision["recommended_route"] is None
    assert decision["alternate_route"] is None


def test_risk_predictor_integration():
    def fake_predictor(
        segment_id,
        rainfall,
        slope,
        elevation,
    ):
        return 0.30

    router = RiskRouter(
        risk_predictor=fake_predictor
    )

    segment = make_segment(1)

    result = router.evaluate_segment(
        segment,
        risk_inputs={
            1: {
                "rainfall": 100.0,
                "slope": 5.0,
                "elevation": 500.0,
            }
        },
    )

    assert result["risk_score"] == 0.30
    assert result["risk_status"] == "SAFE"


def test_missing_risk_cannot_be_treated_as_safe():
    router = RiskRouter()

    route = make_route(
        "R1",
        [make_segment(1)],
    )

    result = router.evaluate_route(route)

    assert result["allowed"] is False
    assert result["safety_status"] == "NOT_EVALUATED"