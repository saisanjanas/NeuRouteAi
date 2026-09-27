import pytest

from routing.route_scorer import RouteScorer


def make_route(
    route_id,
    distance,
    duration,
    risk,
    allowed=True,
):
    return {
        "route_id": route_id,
        "distance_km": distance,
        "duration_minutes": duration,
        "risk_score": risk,
        "maximum_segment_risk": risk,
        "allowed": allowed,
    }


def test_route_scoring():
    scorer = RouteScorer()

    routes = [
        make_route("R1", 100, 120, 0.20),
        make_route("R2", 80, 100, 0.40),
    ]

    scored = scorer.score_routes(routes)

    assert len(scored) == 2
    assert "route_score" in scored[0]
    assert "normalized_risk" in scored[0]


def test_allowed_route_selection():
    scorer = RouteScorer()

    routes = [
        make_route("R1", 100, 120, 0.20),
        make_route("R2", 80, 100, 0.30),
    ]

    selected = scorer.select_best_allowed_route(routes)

    assert selected["allowed"] is True


def test_unsafe_route_not_selected():
    scorer = RouteScorer()

    routes = [
        make_route(
            "UNSAFE",
            50,
            60,
            0.90,
            allowed=False,
        ),
        make_route(
            "SAFE",
            100,
            120,
            0.20,
            allowed=True,
        ),
    ]

    selected = scorer.select_best_allowed_route(routes)

    assert selected["route_id"] == "SAFE"


def test_no_allowed_routes():
    scorer = RouteScorer()

    routes = [
        make_route(
            "R1",
            50,
            60,
            0.90,
            allowed=False,
        )
    ]

    with pytest.raises(RuntimeError):
        scorer.select_best_allowed_route(routes)


def test_weights_must_sum_to_one():
    with pytest.raises(ValueError):
        RouteScorer(
            distance_weight=0.5,
            time_weight=0.5,
            risk_weight=0.5,
        )