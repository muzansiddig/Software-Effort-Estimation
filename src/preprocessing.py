import pandas as pd

MODEL_FEATURES = [
    "year", "rely", "data", "cplx", "time", "stor", "virt", "turn", "acap", 
    "aexp", "pcap", "vexp", "lexp", "modp", "tool", "sced", "equivphyskloc",
    "projectname_Y", "projectname_de", "projectname_erb", "projectname_gal", 
    "projectname_hst", "projectname_slp", "projectname_spl",
    "cat2_application_ground", "cat2_avionicsmonitoring", "cat2_batchdataprocessing", 
    "cat2_communications", "cat2_datacapture", "cat2_launchprocessing", 
    "cat2_missionplanning", "cat2_monitor_control", "cat2_operatingsystem", 
    "cat2_realdataprocessing", "cat2_science", "cat2_simulation", "cat2_utility",
    "forg_g", "center_2", "center_3", "center_5", "center_6",
    "mode_organic", "mode_semidetached",
]

# Mapping dictionary for ordinal cost drivers
ORDINAL_MAP = {
    "vl": 1,
    "l": 2,
    "n": 3,
    "h": 4,
    "vh": 5,
    "xh": 6
}

def preprocess_input(data: dict) -> pd.DataFrame:
    # Map text values to numeric equivalents
    row = {
        "year": data["year"],
        "rely": ORDINAL_MAP.get(data["rely"], 3),
        "data": ORDINAL_MAP.get(data["data"], 3),
        "cplx": ORDINAL_MAP.get(data["cplx"], 3),
        "time": ORDINAL_MAP.get(data["time"], 3),
        "stor": ORDINAL_MAP.get(data["stor"], 3),
        "virt": ORDINAL_MAP.get(data["virt"], 3),
        "turn": ORDINAL_MAP.get(data["turn"], 3),
        "acap": ORDINAL_MAP.get(data["acap"], 3),
        "aexp": ORDINAL_MAP.get(data["aexp"], 3),
        "pcap": ORDINAL_MAP.get(data["pcap"], 3),
        "vexp": ORDINAL_MAP.get(data["vexp"], 3),
        "lexp": ORDINAL_MAP.get(data["lexp"], 3),
        "modp": ORDINAL_MAP.get(data["modp"], 3),
        "tool": ORDINAL_MAP.get(data["tool"], 3),
        "sced": ORDINAL_MAP.get(data["sced"], 3),
        "equivphyskloc": data["equivphyskloc"],
    }

    # One-hot encoding for projectname
    for proj in ["Y", "de", "erb", "gal", "hst", "slp", "spl"]:
        row[f"projectname_{proj}"] = int(data.get("projectname") == proj)

    # One-hot encoding for cat2
    for cat in ["application_ground", "avionicsmonitoring", "batchdataprocessing", "communications", 
                "datacapture", "launchprocessing", "missionplanning", "monitor_control", 
                "operatingsystem", "realdataprocessing", "science", "simulation", "utility"]:
        row[f"cat2_{cat}"] = int(data.get("cat2") == cat)

    # One-hot encoding for forg
    row["forg_g"] = int(data.get("forg") == "g")
    
    # One-hot encoding for center
    for c in ["2", "3", "5", "6"]:
        row[f"center_{c}"] = int(data.get("center") == c)
        
    # One-hot encoding for mode
    row["mode_organic"] = int(data.get("mode") == "organic")
    row["mode_semidetached"] = int(data.get("mode") == "semidetached")

    df = pd.DataFrame([row])
    return df[MODEL_FEATURES]
