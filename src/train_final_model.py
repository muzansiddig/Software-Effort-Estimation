import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/processed/nasa93_encoded.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(
    MODEL_DIR,
    "random_forest_effort_model.joblib"
)

TARGET = "act_effort"


# ============================================================
# LOAD DATA
# ============================================================

print()
print("================================================")
print("TRAINING FINAL RANDOM FOREST MODEL")
print("================================================")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print()
print("Dataset:")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")


# ============================================================
# CHECK TARGET
# ============================================================

if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found."
    )


# ============================================================
# FEATURES / TARGET
# ============================================================

X = df.drop(columns=[TARGET])
y = df[TARGET]


# ============================================================
# REMOVE IDENTIFIER
# ============================================================

if "recordnumber" in X.columns:
    X = X.drop(columns=["recordnumber"])


print()
print("Feature matrix:")
print(f"Features: {X.shape[1]}")
print(f"Samples:  {X.shape[0]}")


# ============================================================
# FINAL RANDOM FOREST
# ============================================================
#
# The selected model is based on the repeated nested
# cross-validation experiments.
#
# Final hyperparameters are chosen from the configurations
# observed during nested CV and the previous RF tuning.
#
# ============================================================

final_rf = RandomForestRegressor(
    n_estimators=200,
    max_depth=5,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features=1.0,
    random_state=42,
    n_jobs=-1
)


# ============================================================
# PIPELINE
# ============================================================

model = Pipeline([
    (
        "rf",
        final_rf
    )
])


# ============================================================
# TRAIN
# ============================================================

print()
print("Training Random Forest...")

model.fit(
    X,
    y
)


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_PATH
)


# ============================================================
# VERIFY MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        "Model file was not created."
    )


# ============================================================
# TEST LOADING
# ============================================================

loaded_model = joblib.load(
    MODEL_PATH
)

test_predictions = loaded_model.predict(
    X.head(3)
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print()
print("================================================")
print("FINAL MODEL TRAINED SUCCESSFULLY")
print("================================================")

print(
    "Model: Random Forest"
)

print(
    f"Training samples: {len(X)}"
)

print(
    f"Features: {X.shape[1]}"
)

print()
print("Final parameters:")

print(
    f"n_estimators     = "
    f"{final_rf.n_estimators}"
)

print(
    f"max_depth        = "
    f"{final_rf.max_depth}"
)

print(
    f"min_samples_split = "
    f"{final_rf.min_samples_split}"
)

print(
    f"min_samples_leaf = "
    f"{final_rf.min_samples_leaf}"
)

print(
    f"max_features     = "
    f"{final_rf.max_features}"
)

print(
    f"random_state     = "
    f"{final_rf.random_state}"
)

print()
print("Model saved to:")
print(MODEL_PATH)

print()
print("Model loading verification:")
print("SUCCESS")

print()
print("Sample predictions:")
print(test_predictions)

print()
print("================================================")
print("FINAL MODEL READY FOR BACKEND")
print("================================================")
