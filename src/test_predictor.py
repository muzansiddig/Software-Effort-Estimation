from predictor import EffortPredictor


predictor = EffortPredictor()


sample = {
    "projectname": "Y",
    "cat2": "simulation",
    "forg": "g",
    "center": "2",
    "year": 1985,
    "mode": "organic",

    "rely": "n",
    "data": "n",
    "cplx": "n",
    "time": "n",
    "stor": "n",
    "virt": "n",
    "turn": "n",
    "acap": "n",
    "aexp": "n",
    "pcap": "n",
    "vexp": "n",
    "lexp": "n",
    "modp": "n",
    "tool": "n",
    "sced": "n",

    "equivphyskloc": 50
}


print("=" * 60)
print("PREDICTORN TEST" if False else "PREDICTOR TEST")
print("=" * 60)

prediction = predictor.predict(sample)

print(f"\nEstimated Effort: {prediction:.4f}")

print("\nPredictor executed successfully.")
