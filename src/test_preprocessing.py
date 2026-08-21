import joblib
from schemas import ProjectInput
from preprocessing import preprocess_input, MODEL_FEATURES

# Load Model
model = joblib.load("models/random_forest_effort_model.joblib")
model_features = list(model.named_steps['rf'].feature_names_in_)

# Create Input
sample = ProjectInput(
    projectname="Y", cat2="simulation", forg="g", center="2", year=1985, mode="organic",
    rely="n", data="n", cplx="n", time="n", stor="n", virt="n", turn="n", 
    acap="n", aexp="n", pcap="n", vexp="n", lexp="n", modp="n", tool="n", 
    sced="n", equivphyskloc=50
)

X = preprocess_input(sample.model_dump())
input_features = list(X.columns)

print("\nInput feature count:")
print(len(input_features))

missing = [f for f in model_features if f not in input_features]
extra = [f for f in input_features if f not in model_features]

print("\nMissing features:", missing)
print("\nExtra features:", extra)

same_order = input_features == model_features
print("\nExact feature order:", same_order)

if len(input_features) != len(model_features):
    raise RuntimeError("FAILED: Feature count does not match.")
if missing or extra or not same_order:
    raise RuntimeError("FAILED: Feature mismatch.")

prediction = model.predict(X)[0]

print("\n" + "=" * 60)
print("PREDICTION TEST")
print("=" * 60)
print(f"Estimated Effort: {prediction:.4f}")
print("\n" + "=" * 60)
print("ALL COMPATIBILITY TESTS PASSED")
print("=" * 60)
