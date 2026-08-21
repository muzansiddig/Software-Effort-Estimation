import pandas as pd
from scipy.io import arff

file_path = "data/raw/nasa93.arff"
data, meta = arff.loadarff(file_path)
df = pd.DataFrame(data)

for column in df.select_dtypes(include=["object"]).columns:
    df[column] = df[column].apply(lambda x: x.decode("utf-8") if isinstance(x, bytes) else x)

print("--- 1. Shape ---")
print(df.shape)

print("\n--- 2. Info ---")
df.info()

print("\n--- 3. Columns List ---")
print(df.columns.tolist())

print("\n--- 4. Null Values ---")
print(df.isnull().sum())

print("\n--- 5. Describe All ---")
print(df.describe(include="all"))
