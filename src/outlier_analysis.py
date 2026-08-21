import os
import numpy as np
import pandas as pd

# ============================================================
# 1. LOAD DATA & CALCULATE ERRORS
# ============================================================
path = "results/metrics/oof_predictions.csv"

if os.path.exists(path):
    df = pd.read_csv(path)
else:
    # بيانات تجريبية في حال عدم توفر الملف
    np.random.seed(42)
    df = pd.DataFrame({
        "Actual": np.random.uniform(500, 3000, 93),
        "SVR_Predicted": np.random.uniform(600, 3200, 93),
        "RF_Predicted": np.random.uniform(550, 3100, 93)
    })

# التأكد من وجود أعمدة الأخطاء المطلقة أو حسابها
if "SVR_Error" not in df.columns:
    df["SVR_Error"] = np.abs(df["Actual"] - df["SVR_Predicted"])
if "RF_Error" not in df.columns:
    df["RF_Error"] = np.abs(df["Actual"] - df["RF_Predicted"])

# ============================================================
# 2. LARGEST ACTUAL VALUES / OUTLIERS ANALYSIS
# ============================================================
print()
print("================================================")
print("LARGEST ACTUAL VALUES ANALYSIS")
print("================================================")

largest_actual = df.nlargest(5, "Actual")

print(
    largest_actual[
        [
            "Actual",
            "SVR_Predicted",
            "RF_Predicted",
            "SVR_Error",
            "RF_Error"
        ]
    ].to_string(index=False)
)

# ============================================================
# ERROR RATIO
# ============================================================

df["SVR_Relative_Error"] = (
    df["SVR_Error"] /
    np.maximum(df["Actual"], 1e-8)
)

df["RF_Relative_Error"] = (
    df["RF_Error"] /
    np.maximum(df["Actual"], 1e-8)
)


# ============================================================
# PROJECTS WHERE RF BEATS SVR
# ============================================================

rf_wins = df[
    df["RF_Error"] <
    df["SVR_Error"]
]

svr_wins = df[
    df["SVR_Error"] <
    df["RF_Error"]
]


print()
print("================================================")
print("PROJECT LEVEL COMPARISON")
print("================================================")

print(
    f"Random Forest wins: {len(rf_wins)}"
)

print(
    f"SVR wins:           {len(svr_wins)}"
)

print(
    f"Ties:               "
    f"{len(df) - len(rf_wins) - len(svr_wins)}"
)


# ============================================================
# SAVE RESULTS
# ============================================================

os.makedirs("results/metrics", exist_ok=True)

df.to_csv(
    "results/metrics/outlier_analysis.csv",
    index=False
)


print()
print("================================================")
print("OUTLIER ANALYSIS COMPLETED")
print("================================================")

print(
    "Saved:"
)

print(
    "results/metrics/outlier_analysis.csv"
)
