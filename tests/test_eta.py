import pytest

from routing.eta import ETACalculator


def test_basic_eta():
    calculator = ETACalculator()

    result = calculator.calculate(120)

    assert result["base_eta_minutes"] == 120.0
    assert result["adjusted_eta_minutes"] == 120.0
    assert result["eta_hours"] == 2.0
    assert result["eta_text"] == "2 hr"


def test_eta_with_factors():
    calculator = ETACalculator()

    result = calculator.calculate(
        100,
        traffic_factor=1.20,
        weather_factor=1.10,
    )

    assert result["adjusted_eta_minutes"] == 132.0
    assert result["eta_text"] == "2 hr 12 min"


def test_route_eta():
    calculator = ETACalculator()

    route = {
        "route_id": "R1",
        "duration_minutes": 90,
    }

    result = calculator.calculate_route_eta(route)

    assert result["base_eta_minutes"] == 90.0
    assert result["adjusted_eta_minutes"] == 90.0


def test_add_eta_to_route():
    calculator = ETACalculator()

    route = {
        "route_id": "R1",
        "duration_minutes": 90,
    }

    result = calculator.add_eta_to_route(route)

    assert result["eta_minutes"] == 90.0
    assert result["eta_hours"] == 1.5
    assert result["eta_text"] == "1 hr 30 min"


def test_negative_duration_rejected():
    calculator = ETACalculator()

    with pytest.raises(ValueError):
        calculator.calculate(-10)


def test_invalid_factor_rejected():
    with pytest.raises(ValueError):
        ETACalculator(
            traffic_factor=0
        )