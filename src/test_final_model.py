import joblib
import pandas as pd
import os

MODEL_PATH = "models/random_forest_effort_model.joblib"

if not os.path.exists(MODEL_PATH):
    print(f"Error: Model not found at {MODEL_PATH}")
    exit(1)

model = joblib.load(MODEL_PATH)

if hasattr(model, 'named_steps') and 'rf' in model.named_steps:
    rf_model = model.named_steps['rf']
else:
    rf_model = model

sample = {
    "data": 0, "cplx": 0, "time": 0, "stor": 0, "virt": 0,
    "turn": 0, "acap": 0, "aexp": 0, "pcap": 0, "vexp": 0,
    "lexp": 0, "modp": 0, "tool": 0, "sced": 0,
    "equivphyskloc": 50,
    "projectname_Y": 1,
    "projectname_de": 0,
    "projectname_erb": 0,
    "projectname_gal": 0,
    "projectname_hst": 0,
    "projectname_slp": 0,
    "projectname_spl": 0,
    "cat2_application_ground": 0,
    "cat2_avionicsmonitoring": 0,
    "cat2_batchdataprocessing": 0,
    "cat2_communications": 0,
    "cat2_datacapture": 0,
    "cat2_launchprocessing": 0,
    "cat2_missionplanning": 0,
    "cat2_monitor_control": 0,
    "cat2_operatingsystem": 0,
    "cat2_realdataprocessing": 0,
    "cat2_science": 0,
    "cat2_simulation": 0,
    "cat2_utility": 0,
    "forg_g": 1,
    "center_2": 0,
    "center_3": 0,
    "center_5": 0,
    "center_6": 0,
    "mode_organic": 1,
    "mode_semidetached": 0,
}

X = pd.DataFrame([sample])

# Align features safely: add missing columns as 0 and reorder strictly
feature_names = getattr(rf_model, 'feature_names_in_', None)
if feature_names is not None:
    for col in feature_names:
        if col not in X.columns:
            X[col] = 0
    X = X[feature_names]

prediction = model.predict(X)[0]

print("\n" + "=" * 60)
print("PREDICTION")
print("=" * 60)

print(f"Estimated Effort: {prediction:.2f}")

print("\nModel test completed successfully.")
