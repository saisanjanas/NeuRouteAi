# ============================================================
# NEU Route AI - Landslide Risk Prediction
# ML Inference Module
# ============================================================

import joblib
import pandas as pd


# ------------------------------------------------------------
# Load trained model and label encoder
# ------------------------------------------------------------

MODEL_PATH = "ML/models/landslide_risk_model.pkl"
ENCODER_PATH = "ML/models/label_encoder.pkl"

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


# ------------------------------------------------------------
# Prediction function
# ------------------------------------------------------------

def predict_risk(
    rainfall: float,
    elevation: float,
    latitude: float,
    longitude: float
):
    """
    Predict landslide size using real environmental features.

    Parameters:
        rainfall   : Rainfall in mm/day
        elevation  : Elevation in metres
        latitude   : Location latitude
        longitude  : Location longitude

    Returns:
        Predicted landslide size
    """

    # Create input dataframe
    input_data = pd.DataFrame([{
        "rainfall_mm_day": rainfall,
        "elevation_m": elevation,
        "latitude": latitude,
        "longitude": longitude
    }])

    # Make prediction
    prediction = model.predict(input_data)

    # Convert encoded prediction to original class
    predicted_size = label_encoder.inverse_transform(prediction)[0]

    return predicted_size


# ------------------------------------------------------------
# Test the model
# ------------------------------------------------------------

if __name__ == "__main__":

    result = predict_risk(
        rainfall=27.368,
        elevation=1551.0,
        latitude=25.309863,
        longitude=94.482147
    )

    print("Predicted landslide size:", result)


# ============================================================
# NEU Route AI - Landslide Risk Prediction
# ML Inference Module
# ============================================================

import joblib
import pandas as pd


# ------------------------------------------------------------
# Model paths
# ------------------------------------------------------------

MODEL_PATH = "ML/models/landslide_risk_model.pkl"
ENCODER_PATH = "ML/models/label_encoder.pkl"


# ------------------------------------------------------------
# Load trained model and encoder
# ------------------------------------------------------------

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


# ------------------------------------------------------------
# Risk mapping
# ------------------------------------------------------------

RISK_MAPPING = {
    "small": {
        "risk_score": 0.25,
        "risk_level": "Low"
    },
    "medium": {
        "risk_score": 0.50,
        "risk_level": "Moderate"
    },
    "large": {
        "risk_score": 0.75,
        "risk_level": "High"
    },
    "very_large": {
        "risk_score": 0.95,
        "risk_level": "Very High"
    }
}


# ------------------------------------------------------------
# Risk prediction function
# ------------------------------------------------------------

def predict_risk(
    rainfall: float,
    elevation: float,
    latitude: float,
    longitude: float
):
    """
    Predict landslide size and application risk.
    """

    # Create input data
    input_data = pd.DataFrame([{
        "rainfall_mm_day": rainfall,
        "elevation_m": elevation,
        "latitude": latitude,
        "longitude": longitude
    }])

    # Predict landslide size
    prediction = model.predict(input_data)

    # Convert encoded prediction to class name
    predicted_size = label_encoder.inverse_transform(prediction)[0]

    # Get risk information
    risk_info = RISK_MAPPING[predicted_size]

    # Return result
    return {
        "predicted_landslide_size": predicted_size,
        "risk_score": risk_info["risk_score"],
        "risk_level": risk_info["risk_level"]
    }


# ------------------------------------------------------------
# Test prediction
# ------------------------------------------------------------

if __name__ == "__main__":

    result = predict_risk(
        rainfall=27.368,
        elevation=1551.0,
        latitude=25.309863,
        longitude=94.482147
    )

    print(result)