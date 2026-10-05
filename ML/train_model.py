# ============================================
# NEU ROUTE AI - RANDOM FOREST TRAINING
# ============================================

import csv
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report


# --------------------------------------------
# 1. File paths
# --------------------------------------------

DATA_FILE = "ML/data/landslide_ml_ready.csv"
MODEL_DIR = "ML/models"

MODEL_FILE = os.path.join(MODEL_DIR, "landslide_risk_model.pkl")
ENCODER_FILE = os.path.join(MODEL_DIR, "label_encoder.pkl")


# --------------------------------------------
# 2. Load dataset
# --------------------------------------------

rows = []

with open(DATA_FILE, "r", encoding="utf-8", newline="") as file:
    reader = csv.DictReader(file)

    for row in reader:
        rows.append(row)

print("Total records:", len(rows))


# --------------------------------------------
# 3. Prepare features
# --------------------------------------------

features = []
targets = []

for row in rows:

    features.append([
        float(row["rainfall_mm_day"]),
        float(row["elevation_m"]),
        float(row["latitude"]),
        float(row["longitude"])
    ])

    targets.append(row["landslide_size"])


# --------------------------------------------
# 4. Convert target labels to numbers
# --------------------------------------------

label_encoder = LabelEncoder()

y = label_encoder.fit_transform(targets)

print("\nTarget classes:")
for number, label in enumerate(label_encoder.classes_):
    print(number, "=", label)


# --------------------------------------------
# 5. Split data
# --------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    features,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# --------------------------------------------
# 6. Create Random Forest model
# --------------------------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)


# --------------------------------------------
# 7. Train model
# --------------------------------------------

print("\nTraining Random Forest...")

model.fit(X_train, y_train)

print("Training completed!")


# --------------------------------------------
# 8. Make predictions
# --------------------------------------------

y_pred = model.predict(X_test)


# --------------------------------------------
# 9. Evaluate model
# --------------------------------------------

accuracy = accuracy_score(y_test, y_pred)

print("\n============================================")
print("MODEL RESULTS")
print("============================================")

print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        labels=list(range(len(label_encoder.classes_))),
        target_names=label_encoder.classes_,
        zero_division=0
    )
)


# --------------------------------------------
# 10. Feature importance
# --------------------------------------------

feature_names = [
    "rainfall_mm_day",
    "elevation_m",
    "latitude",
    "longitude"
]

print("\nFeature Importance:")

for name, importance in zip(
    feature_names,
    model.feature_importances_
):
    print(name, ":", round(importance, 4))


# --------------------------------------------
# 11. Create model folder
# --------------------------------------------

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------
# 12. Save trained model
# --------------------------------------------

joblib.dump(model, MODEL_FILE)

joblib.dump(label_encoder, ENCODER_FILE)

print("\nModel saved to:")
print(MODEL_FILE)

print("\nLabel encoder saved to:")
print(ENCODER_FILE)

print("\n============================================")
print("TRAINING COMPLETE")
print("============================================")