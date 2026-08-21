import os
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor

from sklearn.model_selection import KFold, GridSearchCV

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from scipy.stats import wilcoxon


# ============================================================
# 1. LOAD DATA
# ============================================================

DATA_PATH = "data/processed/nasa93_clean.csv"

df = pd.read_csv(DATA_PATH)

TARGET = "act_effort"

X = df.drop(columns=[TARGET])
y = df[TARGET].astype(float)


# ============================================================
# 2. REMOVE IDENTIFIER
# ============================================================

if "recordnumber" in X.columns:
    X = X.drop(columns=["recordnumber"])


# ============================================================
# 3. FEATURE GROUPS
# ============================================================

numerical_features = [
    "year",
    "equivphyskloc"
]

categorical_features = [
    "projectname",
    "cat2",
    "forg",
    "center",
    "mode"
]

ordinal_features = [
    "rely",
    "data",
    "cplx",
    "time",
    "stor",
    "virt",
    "turn",
    "acap",
    "aexp",
    "pcap",
    "vexp",
    "lexp",
    "modp",
    "tool",
    "sced"
]


# ============================================================
# 4. ORDINAL CATEGORIES
# ============================================================

ordinal_categories = [
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"],
    ["vl", "l", "n", "h", "vh", "xh"]
]


# ============================================================
# 5. PREPROCESSING
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            StandardScaler(),
            numerical_features
        ),

        (
            "cat",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            ),
            categorical_features
        ),

        (
            "ord",
            OrdinalEncoder(
                categories=ordinal_categories,
                handle_unknown="use_encoded_value",
                unknown_value=-1
            ),
            ordinal_features
        )
    ]
)


# ============================================================
# 6. MODELS
# ============================================================

svr_pipeline = Pipeline([
    ("preprocessing", preprocessor),
    ("svr", SVR(kernel="rbf"))
])


rf_pipeline = Pipeline([
    ("preprocessing", preprocessor),
    (
        "rf",
        RandomForestRegressor(
            random_state=42,
            n_jobs=-1
        )
    )
])


# ============================================================
# 7. HYPERPARAMETER GRIDS
# ============================================================

svr_grid = {
    "svr__C": [
        0.1,
        1,
        10,
        100,
        1000
    ],

    "svr__epsilon": [
        0.01,
        0.1,
        0.2,
        0.5,
        1
    ],

    "svr__gamma": [
        "scale",
        "auto",
        0.001,
        0.01,
        0.1
    ]
}


rf_grid = {
    "rf__n_estimators": [
        100,
        200,
        300
    ],

    "rf__max_depth": [
        None,
        3,
        5,
        10
    ],

    "rf__min_samples_split": [
        2,
        5,
        10
    ],

    "rf__min_samples_leaf": [
        1,
        2,
        4
    ],

    "rf__max_features": [
        1.0,
        "sqrt",
        "log2"
    ]
}


# ============================================================
# 8. METRICS
# ============================================================

def calculate_metrics(y_true, y_pred):

    mae = mean_absolute_error(
        y_true,
        y_pred
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_true,
            y_pred
        )
    )

    relative_error = (
        np.abs(y_true - y_pred)
        / np.maximum(np.abs(y_true), 1e-8)
    )

    mmre = np.mean(relative_error)

    pred25 = np.mean(
        relative_error <= 0.25
    )

    r2 = r2_score(
        y_true,
        y_pred
    )

    return {
        "MAE": mae,
        "RMSE": rmse,
        "MMRE": mmre,
        "PRED(25)": pred25,
        "R2": r2
    }


# ============================================================
# 9. NESTED CROSS VALIDATION
# ============================================================

outer_cv = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

inner_cv = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


svr_oof = np.zeros(len(X))
rf_oof = np.zeros(len(X))


print()
print("================================================")
print("REAL NESTED CROSS-VALIDATION")
print("================================================")

print()
print(f"Projects: {len(X)}")
print("Outer folds: 5")
print("Inner folds: 5")

print()
print("IMPORTANT:")
print("Hyperparameter tuning occurs ONLY inside")
print("the training portion of each outer fold.")
print()


# ============================================================
# 10. OUTER LOOP
# ============================================================

for fold, (train_idx, test_idx) in enumerate(
    outer_cv.split(X),
    start=1
):

    print()
    print("------------------------------------------------")
    print(f"OUTER FOLD {fold}/5")
    print("------------------------------------------------")

    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]

    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]

    print(
        f"Training projects: {len(train_idx)}"
    )

    print(
        f"Testing projects:  {len(test_idx)}"
    )


    # ========================================================
    # SVR INNER TUNING
    # ========================================================

    print()
    print("Tuning SVR inside training fold...")

    svr_search = GridSearchCV(
        estimator=svr_pipeline,
        param_grid=svr_grid,
        scoring="neg_root_mean_squared_error",
        cv=inner_cv,
        n_jobs=-1,
        refit=True
    )

    svr_search.fit(
        X_train,
        y_train
    )

    svr_prediction = svr_search.predict(
        X_test
    )

    svr_oof[test_idx] = svr_prediction


    # ========================================================
    # RANDOM FOREST INNER TUNING
    # ========================================================

    print()
    print("Tuning Random Forest inside training fold...")

    rf_search = GridSearchCV(
        estimator=rf_pipeline,
        param_grid=rf_grid,
        scoring="neg_root_mean_squared_error",
        cv=inner_cv,
        n_jobs=-1,
        refit=True
    )

    rf_search.fit(
        X_train,
        y_train
    )

    rf_prediction = rf_search.predict(
        X_test
    )

    rf_oof[test_idx] = rf_prediction


    print()
    print("Best SVR:")
    print(svr_search.best_params_)

    print()
    print("Best Random Forest:")
    print(rf_search.best_params_)


# ============================================================
# 11. FINAL OOF RESULTS
# ============================================================

svr_metrics = calculate_metrics(
    y,
    svr_oof
)

rf_metrics = calculate_metrics(
    y,
    rf_oof
)


results = pd.DataFrame([
    {
        "Model": "SVR-RBF",
        **svr_metrics
    },

    {
        "Model": "Random Forest",
        **rf_metrics
    }
])


# ============================================================
# 12. OOF ERRORS
# ============================================================

svr_errors = np.abs(
    y.to_numpy() - svr_oof
)

rf_errors = np.abs(
    y.to_numpy() - rf_oof
)


# ============================================================
# 13. WILCOXON
# ============================================================

statistic, p_value = wilcoxon(
    svr_errors,
    rf_errors
)


# ============================================================
# 14. SAVE RESULTS
# ============================================================

os.makedirs(
    "results/metrics",
    exist_ok=True
)


results.to_csv(
    "results/metrics/nested_cv_comparison.csv",
    index=False
)


oof_predictions = pd.DataFrame({

    "Actual":
        y.to_numpy(),

    "SVR_Predicted":
        svr_oof,

    "RF_Predicted":
        rf_oof,

    "SVR_Absolute_Error":
        svr_errors,

    "RF_Absolute_Error":
        rf_errors
})


oof_predictions.to_csv(
    "results/metrics/oof_predictions.csv",
    index=False
)


# ============================================================
# 15. FINAL REPORT
# ============================================================

print()
print()
print("================================================")
print("REAL NESTED CV FINAL RESULTS")
print("================================================")

print(
    results.to_string(
        index=False
    )
)


print()
print("================================================")
print("WILCOXON SIGNED-RANK TEST")
print("================================================")

print(
    f"Statistic: {statistic:.6f}"
)

print(
    f"P-value:   {p_value:.6f}"
)


if p_value < 0.05:

    print()
    print(
        "The difference is statistically significant "
        "at alpha = 0.05."
    )

else:

    print()
    print(
        "The difference is NOT statistically significant "
        "at alpha = 0.05."
    )


# ============================================================
# 16. MODEL SELECTION
# ============================================================

best_model = results.loc[
    results["RMSE"].idxmin(),
    "Model"
]


print()
print("================================================")
print("FINAL MODEL SELECTION")
print("================================================")

print(
    f"Best model by OOF RMSE: {best_model}"
)


print()
print("Files created:")

print(
    "results/metrics/nested_cv_comparison.csv"
)

print(
    "results/metrics/oof_predictions.csv"
)

print()
print("================================================")
print("NESTED CROSS-VALIDATION COMPLETED")
print("================================================")